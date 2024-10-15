import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { IfPermission } from '@folio/stripes/core';
import {
  Button,
  Icon,
} from '@folio/stripes/components';


const LinkToPatronPreRegistrations = () => {
  const history = useHistory();

  return (
    <IfPermission perm="ui-users.patron-pre-registrations-view">
      <Button
        to={{
          pathname: '/users/pre-registration-records',
          state: {
            pathname: history?.location?.pathname,
            search: history?.location?.search,
          },
        }}
        buttonStyle="dropdownItem"
      >
        <Icon icon="search">
          <FormattedMessage id="ui-users.actionMenu.preRegistrationRecords" />
        </Icon>
      </Button>
    </IfPermission>
  );
};

export default LinkToPatronPreRegistrations;
