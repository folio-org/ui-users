import { filters2cql } from '@folio/stripes-components/lib/FilterGroups';
import { compilePathTemplate } from '@folio/stripes-connect/RESTResource/RESTResource';

function accountQueryFunction(findAll, queryTemplate, sortMap, filterConfig, failOnCondition) {
  return (queryParams, pathComponents, resourceValues, logger) => {
    const { qindex, f, q: query, s: sort } = resourceValues.query || {};
    const filters = f ? f.replace(/\([0-9]+\)/g, '') : '';
    const { user } = resourceValues || {};

    if ((query === undefined || query === '') &&
        (failOnCondition === 1 || failOnCondition === true)) {
      return null;
    }
    if ((query === undefined || query === '') &&
        (filters === undefined || filters === '') &&
        (failOnCondition === 2)) {
      return null;
    }

    // This check should remain in place until all uses of the $QUERY syntax have been removed from stripes modules
    let cql;
    if (query && qindex) {
      const t = qindex.split('/', 2);
      if (t.length === 1) {
        cql = `${qindex}="${query}*"`;
      } else {
        cql = `${t[0]} =${t[1]} "${query}*"`;
      }
    } else if (query) {
      cql = compilePathTemplate(queryTemplate, queryParams, pathComponents, resourceValues);
      if (cql === null) {
        // Some part of the template requires something that we don't have.
        return null;
      }
    }

    const filterCql = filters2cql(filterConfig, filters);
    if (filterCql) {
      if (cql) {
        cql = `(${cql}) and ${filterCql}`;
      } else {
        cql = filterCql;
      }
    }

    if (cql === undefined) { cql = `userId=${user.id}`; } else { cql = `(${cql}) and (userId=${user.id})`; }

    logger.log('mquery', `query='${query}' filters='${filters}' sort='${sort}' -> ${cql}`);

    return cql;
  };
}

export default accountQueryFunction;

