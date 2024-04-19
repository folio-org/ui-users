import { get } from 'lodash';

import {
  OVERRIDE_BLOCKS_FIELDS,
} from '../../../../../constants';

const overridePossibleBlockName = [
  OVERRIDE_BLOCKS_FIELDS.RENEWAL_DUE_DATE_REQUIRED_BLOCK,
  OVERRIDE_BLOCKS_FIELDS.RENEWAL_BLOCK,
  OVERRIDE_BLOCKS_FIELDS.PATRON_BLOCK,
];

const isOverridableMessage = (error, loan, data) => {
  const overridableBlockName = get(error, ['overridableBlock', 'name'], '');

  if (overridePossibleBlockName.includes(overridableBlockName)) {
    if (overridableBlockName === OVERRIDE_BLOCKS_FIELDS.RENEWAL_DUE_DATE_REQUIRED_BLOCK) {
      data.autoNewDueDate = false;
    }

    return true;
  }

  // allow for override for reminder fees with renewal blocked
  // https://folio-org.atlassian.net/browse/UICIRC-1077
  if (loan?.reminders?.renewalBlocked) {
    return true;
  }

  return false;
};

export default (errors, loan) => {
  const data = {
    overridable: false,
    autoNewDueDate: true,
  };

  data.overridable = errors.every((error) => isOverridableMessage(error, loan, data));
  return data;
};
