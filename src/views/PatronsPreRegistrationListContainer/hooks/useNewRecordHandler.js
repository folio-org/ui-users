import noop from 'lodash/noop';
import { useMutation } from 'react-query';
import {
  useHistory,
  useLocation,
} from 'react-router-dom';

import useUserDuplicatesCheck from './useUserDuplicatesCheck';

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

  const {
    mutateAsync: handle,
    isLoading,
  } = useMutation({
    mutationFn: checkDuplicates,
    onSuccess: (hasDuplicates, user) => {
      const handleSuccess = () => (
        hasDuplicates
          ? handleDuplicates(user, history, location)
          : noop()
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
