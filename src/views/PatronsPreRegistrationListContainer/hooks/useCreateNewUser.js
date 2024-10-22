import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FormattedMessage } from 'react-intl';

import { useOkapiKy, useCallout } from '@folio/stripes/core';

import { PATRON_PREREGISTRATIONS_API, PERMISSIONS_API } from '../../../constants';

// this hook is used to create a new user from pre-registration record
const useCreateNewUser = () => {
  const callout = useCallout();
  const history = useHistory();
  const ky = useOkapiKy();

  const {
    isLoading,
    mutateAsync: createUser,
  } = useMutation({
    mutationFn: async (user) => {
      try {
        const { userId } = await ky.put(`${PATRON_PREREGISTRATIONS_API}/${user.id}/mergeOrCreateUser`).json();
        // create permission user
        const permUserId = uuidv4();
        await ky.post(PERMISSIONS_API, { json: { id: permUserId, userId, permissions: [] } });

        history.push({
          pathname: `/users/view/${userId}`
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        callout.sendCallout({
          message: <FormattedMessage id="ui-users.errors.generic" />,
          type: 'error',
        });
      }
    }
  });

  return {
    createUser,
    isLoading,
  };
};

export default useCreateNewUser;
