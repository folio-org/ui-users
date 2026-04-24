import { AUDIT_USER_ENABLED_SETTING_KEY } from '../../constants';
import useAuditSettingsQuery from './useAuditSettingsQuery';

const useIsAuditEnabled = () => {
  const { settings, isLoading } = useAuditSettingsQuery();
  const isEnabled = settings.some(setting => setting.key === AUDIT_USER_ENABLED_SETTING_KEY && setting.value === true);

  return { isEnabled, isLoading };
};

export default useIsAuditEnabled;
