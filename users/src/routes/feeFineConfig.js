import React from 'react';
import { FormattedMessage } from 'react-intl';

import { makeQueryFunction } from '@folio/stripes/smart-components';

export const filterConfig = [
  {
    label: <FormattedMessage id="ui-users.feefines.ownerLabel" />,
    name: 'owner',
    cql: 'feeFineOwner',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.accounts.history.columns.status" />,
    name: 'status',
    cql: 'paymentStatus.name',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.details.field.feetype" />,
    name: 'type',
    cql: 'feeFineType',
    values: [],
  }, {
    label: <FormattedMessage id="ui-users.details.field.type" />,
    name: 'material',
    cql: 'materialType',
    values: [],
  },
];

export const queryFunction = (findAll, queryTemplate, sortMap, fConfig, failOnCondition, nsParams, a) => {
  const getCql = makeQueryFunction(findAll, queryTemplate, sortMap, fConfig, failOnCondition, nsParams);

  return (queryParams, pathComponents, resourceValues, logger) => {
    let cql = getCql(queryParams, pathComponents, resourceValues, logger);
    const userId = a[0].value;

    if (cql === undefined) {
      cql = `userId==${userId}`;
    } else {
      cql = `(${cql}) and (userId==${userId})`;
    }

    return cql;
  };
};

export const args = [
  { name: 'user', value: 'x' },
];
