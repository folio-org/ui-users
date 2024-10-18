import {
  useHistory,
  useLocation,
} from 'react-router-dom';

import { PatronPreRegistrationRecordsDuplicates } from '../views';

export const PatronPreRegistrationRecordsDuplicatesPage = () => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const onClose = () => {
    history.push({
      pathname: '/users/pre-registration-records',
      search: location.state?.search,
    });
  };

  return (
    <PatronPreRegistrationRecordsDuplicates
      email={searchParams.get('email')}
      onClose={onClose}
    />
  );
};

export default PatronPreRegistrationRecordsDuplicatesPage;
