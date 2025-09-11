import React from 'react';
import { FormattedMessage } from 'react-intl';

import { escapeCqlWildcards } from '@folio/stripes-util';

export default async function asyncValidateField(value, fieldName, initValue, validator) {
  // Don't validate if value is empty or matches initial value
  if (!value || value === initValue) return '';

  const query = `(${fieldName}=="${escapeCqlWildcards(value.trim())}")`;

  validator.reset();
  const records = await validator.GET({ params: { query } });

  if (records.length > 0) {
    return <FormattedMessage id={`ui-users.errors.${fieldName}Unavailable`} />;
  }

  return '';
}