import noop from 'lodash/noop';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';

import { useUserDuplicatesCheck } from './useUserDuplicatesCheck';

export const useNewRecordHandler = () => {
  const history = useHistory();
  const { checkDuplicates } = useUserDuplicatesCheck();

  const {
    mutateAsync: handle,
    isLoading,
  } = useMutation({
    mutationFn: checkDuplicates,
    onSuccess: (hasDuplicates, user) => {
      if (hasDuplicates) {
        history.push({
          pathname: '/users/pre-registration-records/duplicates',
          search: `?email=${user?.contactInfo?.email}`,
        });
      } else {
        // TODO: https://folio-org.atlassian.net/browse/UIU-3223
        noop();
      }
    },
  });

  return {
    handle,
    isLoading,
  };
};
