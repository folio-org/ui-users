import React from 'react';
import AccountsHistoryContainer from './AccountsHistoryContainer';
import AccountsHistory from '../AccountsHistory';

export default function AccountsOpenContainer(props) {
  return (
    <AccountsHistoryContainer {...props}>
      { payload => <AccountsHistory {...payload} />}
    </AccountsHistoryContainer>
  );
}
