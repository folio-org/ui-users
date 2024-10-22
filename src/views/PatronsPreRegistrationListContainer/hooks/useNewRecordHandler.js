import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

import useUserDuplicatesCheck from './useUserDuplicatesCheck';
import useProcessPreRegisteredUser from './useProcessPreRegisteredUser';

const handleDuplicates = (user, history) => {
  history.push({
    pathname: '/users/pre-registration-records/duplicates',
    search: `?email=${user?.contactInfo?.email}`,
  });
};

const useNewRecordHandler = () => {
  const history = useHistory();
  const { checkDuplicates } = useUserDuplicatesCheck();
  const { handlePreRegisteredUser } = useProcessPreRegisteredUser();

  const {
    mutateAsync: handle,
    isLoading,
  } = useMutation({
    mutationFn: checkDuplicates,
    onSuccess: (hasDuplicates, user) => {
      const handleSuccess = hasDuplicates ? handleDuplicates : handlePreRegisteredUser;

      handleSuccess(user, history);
    },
  });

  return {
    handle,
    isLoading,
  };
};

export default useNewRecordHandler;
