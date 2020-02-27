const filterConfig = [
  {
    name: 'active',
    cql: 'active',
    values: [
      { name: 'inactive', cql: 'false' },
      { name: 'active', cql: 'true' },
    ],
  },
  {
    name: 'pg',
    cql: 'patronGroup',
    values: [],
  },
  {
    name: 'tags',
    cql: 'tags.tagList',
    values: [],
  },
];

export default filterConfig;
