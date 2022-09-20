import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { DATE_FORMAT, MIN_ALLOWED_DATE } from '../../constants';

export default function validateBirthdate(value) {
  if (value && moment(value, DATE_FORMAT).isBefore(MIN_ALLOWED_DATE, 'year')) {
    return <FormattedMessage id="ui-users.errors.personal.dateOfBirth" />;
  }

  return null;
}
