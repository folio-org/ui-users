import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  CIRCULATION_SETTINGS_ENDPOINT,
  LOAN_ANONYMIZATION_SETTING_NAMESPACE_KEY,
  LOAN_HISTORY_SETTING_NAME,
  USER_SPECIFIC_LOAN_ANONYMIZATION_ENABLED_TYPES,
} from '../../constants';

const STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Tells whether the tenant allows user-specific loan anonymization preferences
 * (Settings > Circulation > Loan anonymization). If the setting can't be read
 * (interface missing, no permission, request failed), the feature counts as disabled.
 */
const useUserSpecificLoanAnonymization = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: LOAN_ANONYMIZATION_SETTING_NAMESPACE_KEY });

  const canReadSetting = Boolean(
    stripes.hasInterface('circulation-settings') &&
    stripes.hasPerm('circulation.settings.collection.get'),
  );

  const { data } = useQuery(
    [namespace, LOAN_HISTORY_SETTING_NAME],
    () => ky.get(CIRCULATION_SETTINGS_ENDPOINT, {
      searchParams: { query: `name==${LOAN_HISTORY_SETTING_NAME}` },
    }).json(),
    { enabled: canReadSetting, staleTime: STALE_TIME_MS, retry: false },
  );

  const userSpecificType = data?.circulationSettings?.[0]?.value?.closingType?.userSpecific;

  return {
    isEnabled: canReadSetting && USER_SPECIFIC_LOAN_ANONYMIZATION_ENABLED_TYPES.includes(userSpecificType),
  };
};

export default useUserSpecificLoanAnonymization;
