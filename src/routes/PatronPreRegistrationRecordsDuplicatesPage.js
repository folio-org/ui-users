import {
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';

import { useStagingUsersQuery } from '../hooks';
import { PatronPreRegistrationRecordsDuplicates } from '../views';

export const PatronPreRegistrationRecordsDuplicatesPage = () => {
  const { id: stagingUserId } = useParams();
  const history = useHistory();
  const location = useLocation();

  const {
    isLoading,
    users,
  } = useStagingUsersQuery(
    { query: `id=="${stagingUserId}"` },
    { enabled: Boolean(stagingUserId) },
  );

  const onClose = () => {
    history.push({
      pathname: '/users/pre-registration-records',
      search: location.state?.search,
    });
  };

  return (
    <PatronPreRegistrationRecordsDuplicates
      user={users[0]}
      onClose={onClose}
      isLoading={isLoading}
    />
  );
};

export default PatronPreRegistrationRecordsDuplicatesPage;
