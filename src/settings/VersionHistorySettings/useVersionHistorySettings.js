import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

import {
  AUDIT_SETTINGS_ENDPOINT,
  AUDIT_SETTINGS_NAMESPACE_KEY,
  AUDIT_USER_SETTING_GROUP,
} from '../../constants';
import useAuditSettingsQuery from '../../hooks/useAuditSettingsQuery';

const useVersionHistorySettings = () => {
  const ky = useOkapiKy();
  const queryClient = useQueryClient();
  const [namespace] = useNamespace({ key: AUDIT_SETTINGS_NAMESPACE_KEY });

  const { settings, isLoading } = useAuditSettingsQuery({ staleTime: 0 });

  const { mutateAsync } = useMutation({
    mutationFn: ({ body, settingKey }) => {
      return ky.put(`${AUDIT_SETTINGS_ENDPOINT}/${encodeURIComponent(settingKey)}`, { json: body });
    },
  });

  const saveSettings = useCallback(async (updates) => {
    await Promise.all(updates.map(update => mutateAsync({ body: update, settingKey: update.key })));
    await queryClient.invalidateQueries([namespace, AUDIT_USER_SETTING_GROUP]);
  }, [mutateAsync, queryClient, namespace]);

  return {
    settings,
    isLoading,
    saveSettings,
  };
};

export default useVersionHistorySettings;
