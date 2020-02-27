import React from 'react';
import PropTypes from 'prop-types';
import UserRecordContainer from './UserRecordContainer';
import { UserDetail, UserDetailFullscreen } from '../views';

export const UserDetailContainer = ({ children, ...rest }) => (
  <UserRecordContainer {...rest}>
    { payload => <UserDetail {...payload} paneWidth="44%">{children}</UserDetail> }
  </UserRecordContainer>
);

UserDetailContainer.propTypes = {
  children: PropTypes.node
};

export const UserDetailFullscreenContainer = ({ children, ...rest }) => (
  <UserRecordContainer {...rest}>
    { payload => <UserDetailFullscreen {...payload}>{children}</UserDetailFullscreen> }
  </UserRecordContainer>
);

UserDetailFullscreenContainer.propTypes = {
  children: PropTypes.node
};
