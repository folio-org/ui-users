import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import {
  useCallout,
  useOkapiKy,
} from '@folio/stripes/core';
import { getFullName } from '@folio/stripes/util';

import { USERS_API } from '../../../constants';
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
  const ky = useOkapiKy();
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

  const onMerge = useCallback((existingUser) => {
    return mergeOrCreateUser({ stagingUserId: stagingUser?.id, userId: existingUser.id })
      .then(({ userId }) => ky.get(`${USERS_API}/${userId}`).json())
      .then((user) => {
        const name = getFullName(user).trim() || user.username;
        callout.sendCallout({
          message: intl.formatMessage(
            { id: 'ui-users.stagingUser.createUser' },
            { name },
          ),
        });
        history.replace({
          pathname: `/users/view/${user.id}`,
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
    ky,
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
  user: PropTypes.shape({}),
  users: PropTypes.arrayOf(PropTypes.shape({})),
};

export default PreRegistrationRecordsDuplicatesListContainer;
