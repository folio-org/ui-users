import React from 'react';
import PropTypes from 'prop-types';
import UserRecordContainer from './UserRecordContainer';
import { UserDetail, UserDetailFullscreen } from '../views';

export const UserDetailContainer = ({ children, match, ...rest }) => (
  <UserRecordContainer key={`user-record-${match?.params?.id}`} match={match} {...rest}>
    { payload => <UserDetail {...payload} paneWidth="44%">{children}</UserDetail> }
  </UserRecordContainer>
);

UserDetailContainer.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
};

export const UserDetailFullscreenContainer = ({ children, ...rest }) => (
  <UserRecordContainer {...rest}>
    { payload => <UserDetailFullscreen {...payload}>{children}</UserDetailFullscreen> }
  </UserRecordContainer>
);

UserDetailFullscreenContainer.propTypes = {
  children: PropTypes.node
};
