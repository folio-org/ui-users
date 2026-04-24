import React, { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Loading } from '@folio/stripes/components';
import { TitleManager, useCallout } from '@folio/stripes/core';
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import { USER_FIELDS } from './constants';
import { settingsToFormValues, formValuesToSettingUpdates, buildWarnings } from './utils';
import useVersionHistorySettings from './useVersionHistorySettings';
import VersionHistoryForm from './VersionHistoryForm';
import VersionHistoryWarningModal from './VersionHistoryWarningModal';
import css from './VersionHistorySettings.css';

const VersionHistorySettings = () => {
  const { formatMessage } = useIntl();
  const callout = useCallout();
  const { settings, isLoading, saveSettings } = useVersionHistorySettings();
  const { customFields } = useCustomFieldsQuery({
    moduleName: 'users',
    entityType: 'user',
  });

  const [pendingValues, setPendingValues] = useState(null);
  const [currentWarnings, setCurrentWarnings] = useState([]);

  const initialValues = useMemo(() => settingsToFormValues(settings), [settings]);

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

  const performSave = useCallback(async (values) => {
    try {
      const updates = formValuesToSettingUpdates(values, initialValues);

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
  }, [initialValues, saveSettings, callout, formatMessage]);

  const handleSubmit = useCallback((values) => {
    const warnings = buildWarnings(initialValues, values, formatMessage);

    if (warnings.length > 0) {
      setPendingValues(values);
      setCurrentWarnings(warnings);
    } else {
      performSave(values);
    }
  }, [initialValues, performSave]);

  const handleWarningConfirm = useCallback(async () => {
    resetWarningState();
    await performSave(pendingValues);
  }, [pendingValues, performSave, resetWarningState]);

  const handleWarningCancel = useCallback(() => {
    resetWarningState();
  }, [resetWarningState]);

  if (isLoading) return <Loading />;

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
