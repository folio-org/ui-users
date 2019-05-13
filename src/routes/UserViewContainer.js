import React from 'react';
import UserRecordContainer from './UserRecordContainer';
import { UserView } from '../components/views';

const UserViewContainer = (props) => (
  <UserRecordContainer {...props}>
    { payload => <UserView {...payload} /> }
  </UserRecordContainer>
);

export default UserViewContainer;
