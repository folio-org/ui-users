import React from 'react';
import UserRecordContainer from './UserRecordContainer';
import { UserDetail, UserDetailFullscreen } from '../components/Views';

export const UserDetailContainer = ({ children, ...rest }) => (
  <UserRecordContainer {...rest}>
    { payload => <UserDetail {...payload} paneWidth="44%">{children}</UserDetail> }
  </UserRecordContainer>
);

export const UserDetailFullscreenContainer = ({ children, ...rest }) => (
  <UserRecordContainer {...rest}>
    { payload => <UserDetailFullscreen {...payload}>{children}</UserDetailFullscreen> }
  </UserRecordContainer>
);
