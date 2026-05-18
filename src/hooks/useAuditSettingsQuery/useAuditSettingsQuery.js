import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

import {
  AUDIT_SETTINGS_ENDPOINT,
  AUDIT_SETTINGS_NAMESPACE_KEY,
  AUDIT_USER_SETTING_GROUP,
} from '../../constants';

const AUDIT_SETTINGS_STALE_TIME_MS = 5 * 60 * 1000;
const DEFAULT_SETTINGS = [];

const useAuditSettingsQuery = (options = {}) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: AUDIT_SETTINGS_NAMESPACE_KEY });

  const { data, isLoading, isError } = useQuery(
    [namespace, AUDIT_USER_SETTING_GROUP],
    () => ky.get(AUDIT_SETTINGS_ENDPOINT).json(),
    { staleTime: AUDIT_SETTINGS_STALE_TIME_MS, retry: false, ...options },
  );

  return {
    settings: data?.settings ?? DEFAULT_SETTINGS,
    isLoading,
    isError,
  };
};

export default useAuditSettingsQuery;
