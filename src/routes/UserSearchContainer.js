import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  template,
} from 'lodash';
import { stripesConnect } from '@folio/stripes/core';

import {
  makeQueryFunction,
  StripesConnectedSource,
  buildUrl,
  parseFilters,
} from '@folio/stripes/smart-components';

import filterConfig from './filterConfig';
import { UserSearch } from '../views';
import { MAX_RECORDS } from '../constants';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const searchFields = [
  'username="%{query}*"',
  'personal.firstName="%{query}*"',
  'personal.preferredFirstName="%{query}*"',
  'personal.lastName="%{query}*"',
  'personal.email="%{query}*"',
  'barcode="%{query}*"',
  'id="%{query}*"',
  'externalSystemId="%{query}*"',
  'customFields="%{query}*"'
];
const compileQuery = template(`(${searchFields.join(' or ')})`, { interpolate: /%{([\s\S]+?)}/g });

// Generates a filter config in a dynamic fashion for currently
// registerd custom fields.
// This function loops through all currently applied filters
// and it looks for filters which contain 'customFields` name.
// It then generates a custom config for each of them
// replacing the name "customFields-fieldName"
// with "customFields.fieldName" for CQL representation.
function buildFilterConfig(filters) {
  const customFilterConfig = [];
  const parsedFilters = parseFilters(filters);

  Object.keys(parsedFilters).forEach(name => {
    if (name.match('customFields')) {
      customFilterConfig.push(
        {
          name,
          cql: name.split('-').join('.'),
          values: [],
          operator: '=',
        },
      );
    }
  });
  return customFilterConfig;
}

function buildQuery(queryParams, pathComponents, resourceData, logger, props) {
  const customFilterConfig = buildFilterConfig(queryParams.filters);

  return makeQueryFunction(
    'cql.allRecords=1',
    // TODO: Refactor/remove this after work on FOLIO-2066 and RMB-385 is done
    (parsedQuery, _, localProps) => localProps.query.query.trim().replace('*', '').split(/\s+/)
      .map(query => compileQuery({ query }))
      .join(' and '),
    {
      'active': 'active',
      'name': 'personal.lastName personal.firstName',
      'patronGroup': 'patronGroup.group',
      'username': 'username',
      'barcode': 'barcode',
      'email': 'personal.email',
    },
    [...filterConfig, ...customFilterConfig],
    2,
  )(queryParams, pathComponents, resourceData, logger, props);
}

class UserSearchContainer extends React.Component {
  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: { sort: 'name' } },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    resultOffset: { initialValue: 0 },
    records: {
      type: 'okapi',
      records: 'users',
      resultOffset: '%{resultOffset}',
      perRequest: 100,
      path: 'users',
      GET: {
        params: { query: buildQuery },
        staticFallback: { params: {} },
      },
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/users/));
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '200',
      },
      records: 'usergroups',
    },
    loans: {
      type: 'okapi',
      records: 'loans',
      accumulate: true,
      path: () => 'circulation/loans',
      permissionsRequired: 'circulation.loans.collection.get,accounts.collection.get',
      fetch: props => (!!props.stripes.hasInterface('circulation')),
    },
    tags: {
      throwErrors: false,
      type: 'okapi',
      path: 'tags',
      params: {
        query: 'cql.allRecords=1 sortby label',
        limit: '10000',
      },
      records: 'tags',
    },
    departments: {
      type: 'okapi',
      path: `departments?query=cql.allRecords=1 sortby name&limit=${MAX_RECORDS}`,
      records: 'departments',
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: `owners?query=cql.allRecords=1&limit=${MAX_RECORDS}`,
      fetch: props => (!!props.stripes.hasInterface('feesfines')),
      permissionsRequired: 'owners.collection.get',
    },
    refundsReport: {
      type: 'okapi',
      records: 'reportData',
      path: 'feefine-reports/refund',
      clientGeneratePk: false,
      fetch: false,
    },
    cashDrawerReport: {
      type: 'okapi',
      records: 'cashDrawerReport',
      path: 'feefine-reports/cash-drawer-reconciliation',
      clientGeneratePk: false,
      fetch: false,
    },
    cashDrawerReportSources: {
      type: 'okapi',
      records: 'cashDrawerReportSources',
      path: 'feefine-reports/cash-drawer-reconciliation/sources',
      clientGeneratePk: false,
      fetch: false,
    },
    financialTransactionsReport: {
      type: 'okapi',
      records: 'financialTransactionsReport',
      path: 'feefine-reports/financial-transactions-detail',
      clientGeneratePk: false,
      fetch: false,
    },
  });

  static propTypes = {
    children: PropTypes.node,
    location: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      initializedFilterConfig: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
      records: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      query: PropTypes.shape({
        update: PropTypes.func.isRequired,
        replace: PropTypes.func.isRequired,
      }),
      loans: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
      resultOffset: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
      refundsReport: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      cashDrawerReport: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      cashDrawerReportSources: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      financialTransactionsReport: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      logger: PropTypes.object
    }).isRequired,
  }

  constructor(props) {
    super(props);

    this.logger = props.stripes.logger;
    this.log = this.logger.log.bind(this.logger);
    this.searchField = React.createRef();
  }

  componentDidMount() {
    this.source = new StripesConnectedSource(this.props, this.logger);
    if (this.searchField.current) {
      this.searchField.current.focus();
    }
  }

  componentDidUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];
    if (pg.length) {
      const pgFilterConfig = filterConfig.find(group => group.name === 'pg');
      const oldValuesLength = pgFilterConfig.values.length;
      pgFilterConfig.values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
      if (oldValuesLength === 0) {
        this.props.mutator.initializedFilterConfig.replace(true); // triggers refresh of users
      }
    }
    this.source.update(this.props);
  }

  onNeedMoreData = (askAmount, index) => {
    const { resultOffset } = this.props.mutator;

    if (this.source) {
      if (resultOffset && index >= 0) {
        this.source.fetchOffset(index);
      } else {
        this.source.fetchMore(RESULT_COUNT_INCREMENT);
      }
    }
  };

  querySetter = ({ nsValues, state }) => {
    const {
      location: locationProp,
      history,
      mutator: { resultOffset },
    } = this.props;

    if (nsValues.query) {
      nsValues.query = nsValues.query.replace('*', '');
    }

    let location = locationProp;

    // modifying the location hides the user detail view if a search/filter is triggered.
    if (state.changeType !== 'init.reset' && !location.pathname.endsWith('users')) {
      const pathname = '/users';
      location = { ...locationProp, pathname };
    }

    // reset offset when sort values change
    // https://issues.folio.org/browse/UIU-2466
    if (state.sortChanged) {
      resultOffset.replace(0);
    }

    const url = buildUrl(location, nsValues);
    const { pathname, search } = locationProp;

    // Do not push to history if the url didn't change
    // https://issues.folio.org/browse/UIU-2490
    if (`${pathname}${search}` !== url) {
      history.push(url);
    }
  }

  queryGetter = () => {
    return get(this.props.resources, 'query', {});
  }

  render() {
    if (this.source) {
      this.source.update(this.props);
    }

    return (
      <UserSearch
        source={this.source}
        initialSearch="?sort=name"
        onNeedMoreData={this.onNeedMoreData}
        queryGetter={this.queryGetter}
        querySetter={this.querySetter}
        {...this.props}
      >
        { this.props.children }
      </UserSearch>
    );
  }
}

export default stripesConnect(UserSearchContainer);
