import {
  get,
} from 'lodash';

import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  DEFAULT_VALUE,
} from '../../../constants';

export const getPatronName = (actualCostRecord) => {
  const lastName = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_LAST_NAME], DEFAULT_VALUE);
  const firstName = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_FIRST_NAME], DEFAULT_VALUE);
  const middleName = get(actualCostRecord, ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.USER_MIDDLE_NAME], DEFAULT_VALUE);

  let patronName = lastName;

  if (firstName || middleName) {
    patronName = patronName.concat(', ');
  }
  if (firstName) {
    patronName = patronName.concat(firstName);
  }
  if (middleName) {
    patronName = patronName.concat(' ', middleName);
  }

  return patronName;
};

export default getPatronName;
