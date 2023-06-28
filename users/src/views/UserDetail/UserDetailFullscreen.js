import React from 'react';
import { Paneset } from '@folio/stripes/components';
import UserDetail from './UserDetail';

export default function UserDetailFullscreen(props) {
  return (
    <Paneset>
      <UserDetail paneWidth="fill" {...props} />
    </Paneset>
  );
}
