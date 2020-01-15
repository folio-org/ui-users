import React from 'react';

import UserRecordContainer from './UserRecordContainer';
import { UserDetail } from '../views';

const UserDetailContainer = ({ children, ...rest }) => (
  <UserRecordContainer {...rest}>
    { payload => <UserDetail {...payload} paneWidth="44%">{children}</UserDetail> }
  </UserRecordContainer>
);

export default UserDetailContainer;
