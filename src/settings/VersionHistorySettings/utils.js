import React from 'react';
import { FormattedMessage } from 'react-intl';

import { AUDIT_USER_SETTING_GROUP } from '../../constants';
import { RETENTION_MODES, UNIT_TO_DAYS, SETTING_KEYS, DURATION_UNITS } from './constants';

export const renderBold = chunks => <b>{chunks}</b>;

// Sorted descending by days so the greedy unit-matching in settingsToFormValues
// always selects the largest matching unit first (e.g., years before months).
const DAYS_TO_UNIT = Object.entries(UNIT_TO_DAYS)
  .sort(([, a], [, b]) => b - a)
  .map(([unit, days]) => ({ unit, days }));

const findSetting = (settings, key) => settings.find(s => s.key === key);

export const settingsToFormValues = (settings) => {
  const enabledSetting = findSetting(settings, SETTING_KEYS.ENABLED);
  const retentionSetting = findSetting(settings, SETTING_KEYS.RETENTION_PERIOD);
  const anonymizeSetting = findSetting(settings, SETTING_KEYS.ANONYMIZE);
  const excludedFieldsSetting = findSetting(settings, SETTING_KEYS.EXCLUDED_FIELDS);

  const isEnabled = enabledSetting?.value === true;
  const retentionDays = retentionSetting?.value;

  let durationLength = '';
  let durationUnit = '';

  // Parse the stored period into duration fields whenever positive — even when currently
  // disabled — so the prior selection survives disable/enable within a session.
  if (retentionDays > 0) {
    for (const { unit, days } of DAYS_TO_UNIT) {
      if (retentionDays % days === 0) {
        durationLength = String(retentionDays / days);
        durationUnit = unit;
        break;
      }
    }
  }

  let retentionMode = RETENTION_MODES.NEVER;

  if (isEnabled) {
    if (retentionDays === -1) {
      retentionMode = RETENTION_MODES.INDEFINITELY;
    } else if (retentionDays > 0) {
      retentionMode = RETENTION_MODES.DURATION;
    }
  }

  let excludedFields = [];

  try {
    const parsed = excludedFieldsSetting?.value ? JSON.parse(excludedFieldsSetting.value) : [];

    excludedFields = Array.isArray(parsed) ? parsed : [];
  } catch {
    excludedFields = [];
  }

  return {
    retentionMode,
    durationLength,
    durationUnit,
    anonymizeSource: anonymizeSetting?.value === true,
    excludedFields,
    // Raw stored retention period — preserved across disable/enable so warnings
    // can compare a new period against the last one that was actually persisted.
    storedRetentionDays: typeof retentionDays === 'number' ? retentionDays : 0,
  };
};

const buildSettingUpdate = (key, value, type) => ({
  key,
  value,
  type,
  groupId: AUDIT_USER_SETTING_GROUP,
});

// Returns a day-count representation of the retention setting:
// NEVER → 0 (sentinel, not a valid server value), INDEFINITELY → -1, DURATION → computed days.
const getRetentionDays = (values) => {
  if (values.retentionMode === RETENTION_MODES.NEVER) return 0;
  if (values.retentionMode === RETENTION_MODES.INDEFINITELY) return -1;

  return Number(values.durationLength) * UNIT_TO_DAYS[values.durationUnit];
};

// Projects the submitted form values onto the backend-shape settings. Saving NEVER
// resets every feature-specific setting — so a later re-enable starts from a clean
// slate instead of inheriting stale anonymize/excluded-fields/retention values.
const buildNextSettings = (values) => {
  if (values.retentionMode === RETENTION_MODES.NEVER) {
    return {
      enabled: false,
      retentionDays: -1,
      anonymize: false,
      excludedFields: [],
    };
  }

  const isIndefinitely = values.retentionMode === RETENTION_MODES.INDEFINITELY;

  return {
    enabled: true,
    retentionDays: isIndefinitely ? -1 : getRetentionDays(values),
    anonymize: !!values.anonymizeSource,
    excludedFields: values.excludedFields || [],
  };
};

// Projects the initial (backend-derived) form values onto the same shape. Uses
// storedRetentionDays so a currently-NEVER state still carries the last persisted
// period — otherwise the diff would lose that information.
const buildCurrentSettings = (currentValues) => {
  const wasEnabled = currentValues.retentionMode !== RETENTION_MODES.NEVER;

  return {
    enabled: wasEnabled,
    retentionDays: wasEnabled ? getRetentionDays(currentValues) : (currentValues.storedRetentionDays ?? 0),
    anonymize: !!currentValues.anonymizeSource,
    excludedFields: currentValues.excludedFields || [],
  };
};

const sortedJson = (arr) => JSON.stringify([...arr].sort());

export const formValuesToSettingUpdates = (values, currentValues) => {
  const next = buildNextSettings(values);
  const current = buildCurrentSettings(currentValues);
  const updates = [];

  if (next.enabled !== current.enabled) {
    updates.push(buildSettingUpdate(SETTING_KEYS.ENABLED, next.enabled, 'BOOLEAN'));
  }

  if (next.retentionDays !== current.retentionDays) {
    updates.push(buildSettingUpdate(SETTING_KEYS.RETENTION_PERIOD, next.retentionDays, 'INTEGER'));
  }

  if (next.anonymize !== current.anonymize) {
    updates.push(buildSettingUpdate(SETTING_KEYS.ANONYMIZE, next.anonymize, 'BOOLEAN'));
  }

  if (sortedJson(next.excludedFields) !== sortedJson(current.excludedFields)) {
    updates.push(buildSettingUpdate(
      SETTING_KEYS.EXCLUDED_FIELDS,
      JSON.stringify(next.excludedFields),
      'STRING',
    ));
  }

  return updates;
};

const getUnitLabel = (unitValue, formatMessage) => {
  const unit = DURATION_UNITS.find(u => u.value === unitValue);

  return unit ? formatMessage({ id: unit.labelId }) : unitValue;
};

export const buildWarnings = (initialValues, newValues, formatMessage) => {
  const warnings = [];

  const wasEnabled = initialValues.retentionMode !== RETENTION_MODES.NEVER;
  const isEnabled = newValues.retentionMode !== RETENTION_MODES.NEVER;

  if (wasEnabled && !isEnabled) {
    warnings.push({ type: 'purgeAll' });
  }

  if (isEnabled) {
    const oldDays = wasEnabled
      ? getRetentionDays(initialValues)
      : (initialValues.storedRetentionDays ?? 0);
    const newDays = getRetentionDays(newValues);

    const isRetentionShortened = (oldDays === -1 && newDays > 0)
      || (oldDays > 0 && newDays > 0 && newDays < oldDays);

    if (isRetentionShortened) {
      warnings.push({
        type: 'retentionShortened',
        formattedPeriod: `${newValues.durationLength} ${getUnitLabel(newValues.durationUnit, formatMessage)}`,
      });
    }
  }

  if (!initialValues.anonymizeSource && newValues.anonymizeSource) {
    warnings.push({ type: 'anonymize' });
  }

  const oldExcluded = new Set(initialValues.excludedFields || []);
  const newExcluded = newValues.excludedFields || [];
  const addedFields = newExcluded.filter(f => !oldExcluded.has(f));

  if (addedFields.length > 0) {
    warnings.push({ type: 'excludeFields' });
  }

  return warnings;
};

export const validateForm = (values) => {
  const errors = {};

  if (values.retentionMode === RETENTION_MODES.DURATION) {
    const length = Number(values.durationLength);

    if (!values.durationLength || !Number.isInteger(length) || length <= 0) {
      errors.durationLength = <FormattedMessage id="ui-users.errors.missingRequiredField" />;
    }

    if (!values.durationUnit) {
      errors.durationUnit = <FormattedMessage id="ui-users.errors.missingRequiredField" />;
    }
  }

  return errors;
};
