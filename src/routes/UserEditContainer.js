import React from 'react';
import UserRecordContainer from './UserRecordContainer';
import { UserEdit } from '../views';
import { useNumberGeneratorOptions } from '../hooks';
import {TAGS_SCOPE} from "../constants";

const UserEditContainer = (props) => {
  const { data: numberGeneratorData } = useNumberGeneratorOptions();

  return (
    <UserRecordContainer
      tagsScope={TAGS_SCOPE}
      {...props}
    >
      { payload => <UserEdit numberGeneratorData={numberGeneratorData} {...payload} /> }
    </UserRecordContainer>
  );
};

export default UserEditContainer;
