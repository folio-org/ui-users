import React from 'react';
import UserRecordContainer from './UserRecordContainer';
import { UserEdit } from '../views';
import { useNumberGeneratorOptions } from '../hooks';

const UserEditContainer = (props) => {
  const { data: numberGeneratorData } = useNumberGeneratorOptions();

  return (
    <UserRecordContainer {...props}>
      { payload => <UserEdit numberGeneratorData={numberGeneratorData} {...payload} /> }
    </UserRecordContainer>
  );
};

export default UserEditContainer;
