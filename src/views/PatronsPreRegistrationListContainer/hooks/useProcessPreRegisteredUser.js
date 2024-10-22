import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { useOkapiKy, useCallout } from '@folio/stripes/core';

import { PATRON_PREREGISTRATIONS_API, PERMISSIONS_API } from '../../../constants';
import { navigateToUserView } from '../../../utils/utils';

const getFullName = (user) => {
  let firstName = user?.generalInfo?.firstName ?? '';
  const lastName = user?.generalInfo?.lastName ?? '';
  const middleName = user?.generalInfo?.middleName ?? '';
  const preferredFirstName = user?.generalInfo?.preferredFirstName ?? '';

  if (preferredFirstName && firstName) {
    firstName = `${preferredFirstName} (${firstName})`;
  }

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
};

// this hook is used to create a new user from pre-registration record
const useProcessPreRegisteredUser = () => {
  const callout = useCallout();
  const history = useHistory();
  const ky = useOkapiKy();

  const mergeOrCreateUser = (user) => {
    return ky.put(`${PATRON_PREREGISTRATIONS_API}/${user.id}/mergeOrCreateUser`)
      .json()
      .then(({ userId }) => {
        const name = getFullName(user);
        callout.sendCallout({
          message: <FormattedMessage
            id="ui-users.stagingUser.createUser"
            values={{ name }}
          />,
        });
        return userId;
      })
      .catch((error) => {
        throw new Error('Failed to merge or create user: ' + error);
      });
  };

  const createPermissionUser = (userId) => {
    return ky.post(PERMISSIONS_API, { json: { userId, permissions: [] } })
      .catch((error) => {
        throw new Error('Failed to create permission user: ' + error);
      });
  };


  const handleError = (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    if (!error.message.includes('Failed to create permission user')) {
      callout.sendCallout({
        message: <FormattedMessage id="ui-users.errors.generic" />,
        type: 'error',
      });
    }
  };

  const {
    isLoading,
    mutateAsync: handlePreRegisteredUser,
  } = useMutation({
    mutationFn: async (user) => {
      let newUserId;
      mergeOrCreateUser(user)
        .then(async (userId) => {
          newUserId = userId;
          await createPermissionUser(userId);
        })
        .catch((error) => {
          handleError(error, callout);
        })
        .finally(() => {
          if (newUserId) navigateToUserView(history, newUserId);
        });
    }
  });

  return {
    handlePreRegisteredUser,
    isLoading,
  };
};

export default useProcessPreRegisteredUser;
