import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

import { AUDIT_USER_SETTING_GROUP } from '../../constants';

const AUDIT_SETTINGS_STALE_TIME_MS = 5 * 60 * 1000;
const DEFAULT_SETTINGS = [];

const useAuditSettingsQuery = () => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'audit-settings' });

  const { data, isLoading, isError } = useQuery(
    [namespace, AUDIT_USER_SETTING_GROUP],
    () => ky.get(`audit/config/groups/${AUDIT_USER_SETTING_GROUP}/settings`).json(),
    { staleTime: AUDIT_SETTINGS_STALE_TIME_MS, retry: false },
  );

  return {
    settings: data?.settings ?? DEFAULT_SETTINGS,
    isLoading,
    isError,
  };
};

export default useAuditSettingsQuery;
