import { useIntl } from "react-intl";
import { useStripes } from "@folio/stripes/core";
import { localizeCurrencyAmount } from "../../components/util/localizeCurrencyAmount";

export const useLocalizedCurrency = () => {
  const intl = useIntl();
  const stripes = useStripes();

  return {
    formatCurrency: (value) => localizeCurrencyAmount(value, stripes.currency, intl)
  };
}
