import noop from 'lodash/noop';
import PropTypes from 'prop-types';

import { usePatronGroups } from '../../../hooks';

import PreRegistrationRecordsDuplicatesList from './PreRegistrationRecordsDuplicatesList';

const PreRegistrationRecordsDuplicatesListContainer = ({
  email,
  isLoading,
  totalRecords,
  users,
}) => {
  const {
    isLoading: isPatronGroupsLoading,
    patronGroups,
  } = usePatronGroups({ enabled: Boolean(email) });

  // TODO: https://folio-org.atlassian.net/browse/UIU-3225
  const onMerge = () => noop();

  return (
    <PreRegistrationRecordsDuplicatesList
      isLoading={isLoading || isPatronGroupsLoading}
      patronGroups={patronGroups}
      users={users}
      totalRecords={totalRecords}
      onMerge={onMerge}
    />
  );
};

PreRegistrationRecordsDuplicatesListContainer.propTypes = {
  email: PropTypes.string,
  isLoading: PropTypes.bool,
  totalRecords: PropTypes.number,
  users: PropTypes.arrayOf(PropTypes.object),
};

export default PreRegistrationRecordsDuplicatesListContainer;
