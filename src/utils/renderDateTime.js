import { FormattedTime, NoValue } from '@folio/stripes/components';

const renderDateTime = dateValue => {
  return dateValue ? (
    <FormattedTime value={dateValue} day="numeric" month="numeric" year="numeric" hour="numeric" minute="numeric" />
  ) : <NoValue />;
};

export default renderDateTime;
