import { FormattedUTCDate, NoValue } from '@folio/stripes/components';

const renderDate = dateValue => {
  return dateValue ? <FormattedUTCDate value={dateValue} /> : <NoValue />;
};

export default renderDate;
