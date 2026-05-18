import { useCallback, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Loading } from '@folio/stripes/components';
import { TitleManager, useCallout } from '@folio/stripes/core';
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import { USER_FIELDS } from './constants';
import {
  settingsToFormValues,
  getStoredRetentionDays,
  formValuesToSettingUpdates,
  buildWarnings,
} from './utils';
import useVersionHistorySettings from './useVersionHistorySettings';
import VersionHistoryForm from './VersionHistoryForm';
import VersionHistoryWarningModal from './VersionHistoryWarningModal';
import css from './VersionHistorySettings.css';

const VersionHistorySettings = () => {
  const { formatMessage } = useIntl();
  const callout = useCallout();
  const { settings, isLoading, saveSettings } = useVersionHistorySettings();
  const { customFields, isLoadingCustomFields } = useCustomFieldsQuery({
    moduleName: 'users',
    entityType: 'user',
  });

  const [pendingValues, setPendingValues] = useState(null);
  const [currentWarnings, setCurrentWarnings] = useState([]);
  // Holds final-form's submission promise resolver while the warning modal is
  // open, so `submitting` stays true (and the Save button stays disabled) for
  // the entire confirm/cancel + PUT round-trip — not just the synchronous
  // handleSubmit call.
  const submitResolverRef = useRef(null);

  const initialValues = useMemo(() => settingsToFormValues(settings), [settings]);
  const storedRetentionDays = useMemo(() => getStoredRetentionDays(settings), [settings]);

  const fieldOptions = useMemo(() => {
    const userOpts = USER_FIELDS.map(({ value, labelId }) => ({
      value,
      label: formatMessage({ id: labelId }),
    }));
    const customOpts = (customFields || []).map(cf => ({
      value: `customFields.${cf.refId}`,
      label: cf.name,
    }));

    return [...userOpts, ...customOpts];
  }, [formatMessage, customFields]);

  const warningModalOpen = currentWarnings.length > 0;

  const resetWarningState = useCallback(() => {
    setPendingValues(null);
    setCurrentWarnings([]);
  }, []);

  const finishSubmission = useCallback(() => {
    submitResolverRef.current?.();
    submitResolverRef.current = null;
  }, []);

  const performSave = useCallback(async (values) => {
    try {
      const updates = formValuesToSettingUpdates(values, initialValues, storedRetentionDays);

      if (updates.length > 0) {
        await saveSettings(updates);
      }

      callout.sendCallout({
        message: formatMessage({ id: 'ui-users.settings.versionHistory.save.success' }),
      });
    } catch {
      callout.sendCallout({
        type: 'error',
        message: formatMessage({ id: 'ui-users.settings.versionHistory.save.error' }),
      });
    }
  }, [initialValues, storedRetentionDays, saveSettings, callout, formatMessage]);

  const handleSubmit = useCallback((values) => {
    const warnings = buildWarnings(initialValues, values, formatMessage, storedRetentionDays);

    if (warnings.length === 0) {
      return performSave(values);
    }

    return new Promise((resolve) => {
      submitResolverRef.current = resolve;
      setPendingValues(values);
      setCurrentWarnings(warnings);
    });
  }, [initialValues, storedRetentionDays, formatMessage, performSave]);

  const handleWarningConfirm = useCallback(async () => {
    resetWarningState();
    try {
      await performSave(pendingValues);
    } finally {
      finishSubmission();
    }
  }, [pendingValues, performSave, resetWarningState, finishSubmission]);

  const handleWarningCancel = useCallback(() => {
    resetWarningState();
    finishSubmission();
  }, [resetWarningState, finishSubmission]);

  if (isLoading || isLoadingCustomFields) return <Loading />;

  return (
    <TitleManager record={formatMessage({ id: 'ui-users.settings.versionHistory' })}>
      <div className={css.container}>
        <VersionHistoryForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          fieldOptions={fieldOptions}
        />
        <VersionHistoryWarningModal
          open={warningModalOpen}
          warnings={currentWarnings}
          onConfirm={handleWarningConfirm}
          onCancel={handleWarningCancel}
        />
      </div>
    </TitleManager>
  );
};

export default VersionHistorySettings;
