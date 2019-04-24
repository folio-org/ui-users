import React from 'react';
import UserRecordContainer from './UserRecordContainer';
import UserEdit from '../views/UserRecord/UserEdit';

const UserViewContainer = (props) => (
  <UserRecordContainer {...props}>
    { payload => <UserEdit {...payload} /> }
  </UserRecordContainer>
);

export default UserViewContainer;
