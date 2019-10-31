import React from 'react';
import UserRecordContainer from './UserRecordContainer';
import { UserEdit } from '../views';

const UserEditContainer = (props) => (
  <UserRecordContainer {...props}>
    { payload => <UserEdit {...payload} /> }
  </UserRecordContainer>
);

export default UserEditContainer;
