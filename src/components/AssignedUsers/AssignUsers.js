import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { keyBy } from 'lodash';

import {
  Pluggable,
  withStripes,
} from '@folio/stripes/core';

import styles from './AssignUsers.css';

const buttonLabel = <FormattedMessage id="ui-users.permissions.assignUsers.actions.assign" />;

const AssignUsers = ({ assignUsers, stripes, selectedUsers }) => {
  const initialSelectedUsers = useMemo(() => keyBy(selectedUsers, 'id'), [selectedUsers]);

  return (
    <div className={styles.AssignUsersWrapper}>
      <Pluggable
        aria-haspopup="true"
        dataKey="assignUsers"
        searchButtonStyle="default"
        searchLabel={buttonLabel}
        stripes={stripes}
        type="find-user"
        selectUsers={assignUsers}
        initialSelectedUsers={initialSelectedUsers}
      >
        <FormattedMessage id="ui-users.permissions.assignUsers.actions.assign.notAvailable" />
      </Pluggable>
    </div>
  );
};

AssignUsers.propTypes = {
  assignUsers: PropTypes.func.isRequired,
  stripes: PropTypes.object.isRequired,
  selectedUsers: PropTypes.arrayOf(PropTypes.object),
};

export default withStripes(AssignUsers);
