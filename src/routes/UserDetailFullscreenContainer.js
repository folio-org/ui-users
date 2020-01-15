import React from 'react';

import UserRecordContainer from './UserRecordContainer';
import { UserDetailFullscreen } from '../views';

const UserDetailFullscreenContainer = ({ children, ...rest }) => (
  <UserRecordContainer {...rest}>
    { payload => <UserDetailFullscreen {...payload}>{children}</UserDetailFullscreen> }
  </UserRecordContainer>
);

export default UserDetailFullscreenContainer;
