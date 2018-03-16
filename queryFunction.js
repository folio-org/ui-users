import { filters2cql } from '@folio/stripes-components/lib/FilterGroups';

const makeQueryFunction = (findAll, queryTemplate, sortMap, filterConfig) => (queryParams, _pathComponents, _resourceValues, logger) => {
  const user = _resourceValues.user.id || '';

  const { q, f } = queryParams || {};
  const query = q;
  const filters = (f) ? f.replace(/\([0-9]+\)/g, '') : '';

  let cql = !query ? undefined : queryTemplate.replace(/\$QUERY/g, query);
  const filterCql = filters2cql(filterConfig, filters);

  if (filterCql) {
    if (cql) {
      cql = `(${cql}) and ${filterCql}`;
    } else {
      cql = filterCql;
    }
  }

  const { s } = queryParams || {};
  const sort = s;
  if (sort) {
    const sortIndexes = sort.split(',').map((sort1) => {
      let reverse = false;
      if (sort1.startsWith('-')) {
        sort1 = sort1.substr(1);
        reverse = true;
      }
      let sortIndex = sortMap[sort1] || sort1;
      if (reverse) {
        sortIndex = `${sortIndex.replace(' ', '/sort.descending ')}/sort.descending`;
      }
      return sortIndex;
    });

    if (cql === undefined) cql = findAll;
    cql += ` sortby ${sortIndexes.join(' ')}`;
  }

  if (cql === undefined) { cql = `userId=${user}`; } else { cql = `(${cql}) and (userId=${user})`; }

  logger.log('mquery', `query='${query}' filters='${filters}' sort='${sort}' -> ${cql}`);
  return cql;
};

export default makeQueryFunction;

