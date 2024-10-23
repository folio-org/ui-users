import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useCallout } from '@folio/stripes/core';
import { getFullName } from '@folio/stripes/util';

import {
  usePatronGroups,
  useStagingUserMutation,
} from '../../../hooks';
import PreRegistrationRecordsDuplicatesList from './PreRegistrationRecordsDuplicatesList';

const PreRegistrationRecordsDuplicatesListContainer = ({
  isLoading,
  totalRecords,
  user: stagingUser,
  users,
}) => {
  const intl = useIntl();
  const history = useHistory();
  const callout = useCallout();

  const {
    isLoading: isPatronGroupsLoading,
    patronGroups,
  } = usePatronGroups({ enabled: Boolean(stagingUser?.id) });

  const {
    mergeOrCreateUser,
    isLoading: isMutating,
  } = useStagingUserMutation();

  const onMerge = useCallback((user) => {
    return mergeOrCreateUser({ stagingUserId: stagingUser?.id, userId: user.id })
      .then(({ userId }) => {
        const name = getFullName(user).trim() || user.username;
        callout.sendCallout({
          message: intl.formatMessage(
            { id: 'ui-users.stagingUser.createUser' },
            { name },
          ),
        });
        history.replace({
          pathname: `/users/view/${userId}`,
        });
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console

        callout.sendCallout({
          message: intl.formatMessage({ id: 'ui-users.errors.generic' }),
          type: 'error',
          timeout: 0,
        });
      });
  }, [
    callout,
    history,
    intl,
    mergeOrCreateUser,
    stagingUser?.id,
  ]);

  return (
    <PreRegistrationRecordsDuplicatesList
      isLoading={isLoading || isPatronGroupsLoading || isMutating}
      patronGroups={patronGroups}
      users={users}
      totalRecords={totalRecords}
      onMerge={onMerge}
    />
  );
};

PreRegistrationRecordsDuplicatesListContainer.propTypes = {
  isLoading: PropTypes.bool,
  totalRecords: PropTypes.number,
  user: PropTypes.object,
  users: PropTypes.arrayOf(PropTypes.object),
};

export default PreRegistrationRecordsDuplicatesListContainer;
