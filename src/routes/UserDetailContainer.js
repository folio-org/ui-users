import React from 'react';
import UserRecordContainer from './UserRecordContainer';
import { UserDetail, UserDetailFullscreen } from '../components/views';

export const UserDetailContainer = (props) => (
  <UserRecordContainer {...props}>
    { payload => <UserDetail {...payload} /> }
  </UserRecordContainer>
);

export const UserDetailFullscreenContainer = (props) => (
  <UserRecordContainer {...props}>
    { payload => <UserDetailFullscreen {...payload} /> }
  </UserRecordContainer>
);
