import React from 'react';
import { FormattedMessage } from 'react-intl';

import memoize from '../util/memoize';

// validate field asynchronously
export default function asyncValidateField(fieldName, initValue, validator) {
  return memoize(async (value) => {
    if (!value || value === initValue) return '';

    const query = `(${fieldName}=="${value}")`;

    validator.reset();
    const records = await validator.GET({ params: { query } });

    if (records.length > 0) {
      return <FormattedMessage id={`ui-users.errors.${fieldName}Unavailable`} />;
    }

    return '';
  });
}
