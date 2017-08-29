import _ from 'lodash';
import queryString from 'query-string';

const removeQueryParam = (qp, loc, hist) => {
  const parsed = queryString.parse(loc.search);
  _.unset(parsed, qp);
  hist.push(`${loc.pathname}?${queryString.stringify(parsed)}`);
};

export default removeQueryParam;
