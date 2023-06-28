import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { DATE_FORMAT, MIN_ALLOWED_DATE } from '../../constants';

export default function validateMinDate(errorMessageKey, minAllowedDate = MIN_ALLOWED_DATE) {
  return (value) => {
    if (value && moment(value, DATE_FORMAT).isBefore(minAllowedDate, 'year')) {
      return <FormattedMessage id={errorMessageKey} />;
    }
    return null;
  };
}
