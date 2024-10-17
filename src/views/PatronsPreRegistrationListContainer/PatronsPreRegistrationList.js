import PropTypes from 'prop-types';
import { MultiColumnList, Button } from '@folio/stripes/components';
import { useIntl, FormattedMessage } from 'react-intl';
import { get, noop } from 'lodash';

import { visibleColumns, columnMapping, COLUMNS_NAME } from './constants';

const PatronsPreRegistrationList = ({
  data,
  isEmptyMessage,
  totalCount,
  onNeedMoreData
}) => {
  const intl = useIntl();

  const preRegistrationsListFormatter = () => ({
    [COLUMNS_NAME.ACTION]: () => (
      <Button
        type="button"
        onClick={noop} // #TODO this will be updated in the scope of next ticket
      >
        <FormattedMessage id="stripes-components.addNew" />
      </Button>
    ),
    [COLUMNS_NAME.FIRST_NAME]: user => get(user, ['generalInfo', 'firstName']),
    [COLUMNS_NAME.LAST_NAME]: user => get(user, ['generalInfo', 'lastName']),
    [COLUMNS_NAME.MIDDLE_NAME]: user => get(user, ['generalInfo', 'middleName']),
    [COLUMNS_NAME.PREFERRED_FIRST_NAME]: user => get(user, ['generalInfo', 'preferredFirstName']),
    [COLUMNS_NAME.EMAIL]: user => get(user, ['contactInfo', 'email']),
    [COLUMNS_NAME.PHONE_NUMBER]: user => get(user, ['contactInfo', 'phone']),
    [COLUMNS_NAME.MOBILE_NUMBER]: user => get(user, ['contactInfo', 'mobilePhone']),
    [COLUMNS_NAME.ADDRESS]: user => {
      const addressInfo = get(user, 'addressInfo');
      return Object.values(addressInfo).join(',');
    },
    [COLUMNS_NAME.EMAIL_COMMUNICATION_PREFERENCES]: user => get(user, ['preferredEmailCommunication']).join(','),
    [COLUMNS_NAME.SUBMISSION_DATE]: user => {
      const submissionDate = get(user, ['metadata', 'updatedDate']);
      return `${intl.formatDate(submissionDate)}, ${intl.formatTime(submissionDate)}`;
    },
    [COLUMNS_NAME.EMAIL_VERIFICATION]: user => {
      const isEmailVerified = get(user, 'isEmailVerified');
      if (isEmailVerified) return intl.formatMessage({ id: 'ui-users.stagingRecords.activated' });
      else return intl.formatMessage({ id: 'ui-users.stagingRecords.notActivated' });
    }
  });

  return (
    <MultiColumnList
      autosize
      columnMapping={columnMapping}
      contentData={data}
      fullWidth
      formatter={preRegistrationsListFormatter()}
      hasMargin
      id="PatronsPreRegistrationsList"
      data-testid="PatronsPreRegistrationsList"
      isEmptyMessage={isEmptyMessage}
      onNeedMoreData={onNeedMoreData}
      pagingType="prev-next"
      pageAmount={100}
      totalCount={totalCount}
      visibleColumns={visibleColumns}
    />
  );
};

PatronsPreRegistrationList.propTypes = {
  isEmptyMessage: PropTypes.node.isRequired,
  totalCount: PropTypes.number.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onNeedMoreData: PropTypes.func.isRequired,
};

export default PatronsPreRegistrationList;
