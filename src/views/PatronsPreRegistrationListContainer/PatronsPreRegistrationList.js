import PropTypes from 'prop-types';
import { get } from 'lodash';
import {
  useIntl,
  FormattedMessage,
} from 'react-intl';

import {
  MultiColumnList,
  Button,
} from '@folio/stripes/components';
import { IfPermission } from '@folio/stripes/core';

import {
  visibleColumns,
  columnMapping,
  COLUMNS_NAME,
} from './constants';
import { useNewRecordHandler } from './hooks';

const PatronsPreRegistrationList = ({
  data,
  isEmptyMessage,
  totalCount,
  onNeedMoreData,
  onSort,
  sortOrder,
}) => {
  const intl = useIntl();

  const {
    handle,
    isLoading,
  } = useNewRecordHandler();

  const renderActionColumn = (user) => (
    <IfPermission perm="ui-users.patron-pre-registrations.execute">
      <Button
        type="button"
        disabled={isLoading}
        onClick={() => handle(user)}
        marginBottom0
      >
        <FormattedMessage id="stripes-components.addNew" />
      </Button>
    </IfPermission>
  );

  const preRegistrationsListFormatter = () => ({
    [COLUMNS_NAME.ACTION]: renderActionColumn,
    [COLUMNS_NAME.FIRST_NAME]: user => get(user, ['generalInfo', 'firstName']),
    [COLUMNS_NAME.LAST_NAME]: user => get(user, ['generalInfo', 'lastName']),
    [COLUMNS_NAME.MIDDLE_NAME]: user => get(user, ['generalInfo', 'middleName'], ''),
    [COLUMNS_NAME.PREFERRED_FIRST_NAME]: user => get(user, ['generalInfo', 'preferredFirstName'], ''),
    [COLUMNS_NAME.EMAIL]: user => get(user, ['contactInfo', 'email']),
    [COLUMNS_NAME.PHONE_NUMBER]: user => get(user, ['contactInfo', 'phone'], ''),
    [COLUMNS_NAME.MOBILE_NUMBER]: user => get(user, ['contactInfo', 'mobilePhone'], ''),
    [COLUMNS_NAME.ADDRESS]: user => {
      const addressInfo = get(user, 'addressInfo', {});
      return Object.values(addressInfo).join(',');
    },
    [COLUMNS_NAME.EMAIL_COMMUNICATION_PREFERENCES]: user => get(user, ['preferredEmailCommunication'], []).join(','),
    [COLUMNS_NAME.SUBMISSION_DATE]: user => {
      const submissionDate = get(user, ['metadata', 'updatedDate']);
      return `${intl.formatDate(submissionDate)}, ${intl.formatTime(submissionDate)}`;
    },
    [COLUMNS_NAME.EMAIL_VERIFICATION]: user => {
      const isEmailVerified = get(user, 'isEmailVerified');
      if (isEmailVerified) return intl.formatMessage({ id: 'ui-users.stagingRecords.activated' });
      else return intl.formatMessage({ id: 'ui-users.stagingRecords.notActivated' });
    },
    [COLUMNS_NAME.MINOR]: user => {
      return user?.minor
        ? intl.formatMessage({ id: 'ui-users.stagingRecords.minor.yes' })
        : '';
    },
  });

  return (
    <MultiColumnList
      id="PatronsPreRegistrationsList"
      data-testid="PatronsPreRegistrationsList"
      autosize
      hasMargin
      fullWidth
      columnMapping={columnMapping}
      contentData={data}
      formatter={preRegistrationsListFormatter()}
      isEmptyMessage={isEmptyMessage}
      onNeedMoreData={onNeedMoreData}
      pagingType="prev-next"
      pageAmount={100}
      totalCount={totalCount}
      visibleColumns={visibleColumns}
      nonInteractiveHeaders={[COLUMNS_NAME.ACTION]}
      showSortIndicator
      sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
      sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
      onHeaderClick={onSort}
    />
  );
};

PatronsPreRegistrationList.propTypes = {
  isEmptyMessage: PropTypes.node.isRequired,
  totalCount: PropTypes.number.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onNeedMoreData: PropTypes.func.isRequired,
  sortOrder: PropTypes.string,
  onSort: PropTypes.func.isRequired,
};

export default PatronsPreRegistrationList;
