import noop from 'lodash/noop';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

import useUserDuplicatesCheck from './useUserDuplicatesCheck';

const handleDuplicates = (user, history) => {
  history.push({
    pathname: '/users/pre-registration-records/duplicates',
    search: `?email=${user?.contactInfo?.email}`,
  });
};

const useNewRecordHandler = () => {
  const history = useHistory();
  const { checkDuplicates } = useUserDuplicatesCheck();

  const {
    mutateAsync: handle,
    isLoading,
  } = useMutation({
    mutationFn: checkDuplicates,
    onSuccess: (hasDuplicates, user) => {
      return hasDuplicates
        ? handleDuplicates(user, history)
        // TODO: https://folio-org.atlassian.net/browse/UIU-3223
        : noop();
    },
  });

  return {
    handle,
    isLoading,
  };
};

export default useNewRecordHandler;
