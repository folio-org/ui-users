import { useIntl } from "react-intl";
import { useStripes } from "@folio/stripes/core";
import { getFormattedCurrency } from "../../components/util/getFormattedCurrency";

export const useLocalizedCurrency = () => {
  const intl = useIntl();
  const stripes = useStripes();

  return {
    formatCurrency: (value) => getFormattedCurrency(value, stripes.currency, intl)
  };
}
