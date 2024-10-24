import { useMutation } from 'react-query';
import {
  useHistory,
  useLocation,
} from 'react-router-dom';

import useUserDuplicatesCheck from './useUserDuplicatesCheck';
import useProcessPreRegisteredUser from './useProcessPreRegisteredUser';

const handleDuplicates = (user, history, location) => {
  history.push({
    pathname: `/users/pre-registration-records/duplicates/${user.id}`,
    state: { search: location.search },
  });
};

const useNewRecordHandler = () => {
  const history = useHistory();
  const location = useLocation();
  const { checkDuplicates } = useUserDuplicatesCheck();
  const { handlePreRegisteredUser } = useProcessPreRegisteredUser();

  const {
    mutateAsync: handle,
    isLoading,
  } = useMutation({
    mutationFn: checkDuplicates,
    onSuccess: (hasDuplicates, user) => {
      const handleSuccess = () => (
        hasDuplicates
          ? handleDuplicates(user, history, location)
          : handlePreRegisteredUser
      );

      handleSuccess();
    },
  });

  return {
    handle,
    isLoading,
  };
};

export default useNewRecordHandler;
