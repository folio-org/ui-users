import React from 'react';
import { FormattedMessage } from 'react-intl';

const filterConfig = [
  {
    label: <FormattedMessage id="ui-users.status" />,
    name: 'active',
    cql: 'active',
    values: [
      { name: 'inactive', cql: 'false' },
      { name: 'active', cql: 'true' },
    ],
  },
  {
    label: <FormattedMessage id="ui-users.information.patronGroup" />,
    name: 'pg',
    cql: 'patronGroup',
    values: [], // will be filled in by componentDidUpdate
  },
  {
    name: 'tags',
    cql: 'tags',
    values: [],
  },
];

export default filterConfig;
