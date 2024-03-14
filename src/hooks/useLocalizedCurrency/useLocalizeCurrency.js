import { useIntl } from 'react-intl';
import { useStripes } from '@folio/stripes/core';
import localizeCurrencyAmount from '../../components/util/localizeCurrencyAmount';

const useLocalizeCurrency = () => {
  const intl = useIntl();
  const stripes = useStripes();

  return {
    localizeCurrency: (value) => localizeCurrencyAmount(value, stripes.currency, intl)
  };
};

export default useLocalizeCurrency;
