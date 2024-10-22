import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

import useUserDuplicatesCheck from './useUserDuplicatesCheck';
import useCreateNewUser from './useCreateNewUser';

const handleDuplicates = (user, history) => {
  history.push({
    pathname: '/users/pre-registration-records/duplicates',
    search: `?email=${user?.contactInfo?.email}`,
  });
};

const useNewRecordHandler = () => {
  const history = useHistory();
  const { checkDuplicates } = useUserDuplicatesCheck();
  const { createUser } = useCreateNewUser();

  const {
    mutateAsync: handle,
    isLoading,
  } = useMutation({
    mutationFn: checkDuplicates,
    onSuccess: (hasDuplicates, user) => {
      const handleSuccess = hasDuplicates ? handleDuplicates : createUser;

      handleSuccess(user, history);
    },
  });

  return {
    handle,
    isLoading,
  };
};

export default useNewRecordHandler;
