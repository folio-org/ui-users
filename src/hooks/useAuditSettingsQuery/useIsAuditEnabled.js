import { AUDIT_USER_ENABLED_SETTING_KEY } from '../../constants';
import useAuditSettingsQuery from './useAuditSettingsQuery';

const useIsAuditEnabled = (options = {}) => {
  const { settings, isLoading, isError } = useAuditSettingsQuery(options);
  const isEnabled = settings.some(setting => setting.key === AUDIT_USER_ENABLED_SETTING_KEY && setting.value === true);

  return { isEnabled, isLoading, isError };
};

export default useIsAuditEnabled;
