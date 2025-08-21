import React from 'react';
import PropTypes from 'prop-types';
import {
  cloneDeep,
  get,
  template,
  flowRight,
  noop,
} from 'lodash';

import {
  stripesConnect,
  withOkapiKy,
} from '@folio/stripes/core';
import {
  makeQueryFunction,
  StripesConnectedSource,
  buildUrl,
} from '@folio/stripes/smart-components';

import { UserSearch } from '../views';
import { MAX_RECORDS } from '../constants';
import filterConfig from './filterConfig';
import { buildFilterConfig } from './utils';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const searchFields = [
  'username="%{query}*"',
  'personal.firstName="%{query}*"',
  'personal.preferredFirstName="%{query}*"',
  'personal.lastName="%{query}*"',
  'personal.middleName="%{query}*"',
  'personal.email="%{query}*"',
  'barcode="%{query}*"',
  'id="%{query}*"',
  'externalSystemId="%{query}*"',
  'customFields="%{query}*"'
];

/*
  Some of the special characters that are allowed while creating a tag are  "", \, *, ?
  These special characters cause CQL exceptions while searching the user records, which are
  assigned with such tags.
  This function "escapeSpecialCharactersInTagFilters" intends to escape the special characters
  in filters of type "Tags"
  Ref: https://issues.folio.org/browse/UIU-2995
*/

const escapeSpecialCharactersInTagFilters = (queryParams, resourceData) => {
  const newResourceData = cloneDeep(resourceData);
  let escapedFilters;

  if (resourceData.query.filters) {
    const filterArr = resourceData.query.filters.split(',');
    escapedFilters = filterArr.map(f => {
      let newF = f;
      if (f.startsWith('tags.')) {
        newF = f.replace(/["^*?\\]/g, c => '\\' + c);
      }
      return newF;
    });
    escapedFilters = escapedFilters.join(',');

    newResourceData.query.filters = escapedFilters;
    queryParams.filters = escapedFilters;
  }
  return newResourceData;
};

export function buildQuery(queryParams, pathComponents, resourceData, logger, props) {
  const customFilterConfig = buildFilterConfig(queryParams.filters);
  const newResourceData = escapeSpecialCharactersInTagFilters(queryParams, resourceData);

  const compileQuery = props.stripes.hasInterface('users', '16.3') ?
    template('keywords="%{query}*"', { interpolate: /%{([\s\S]+?)}/g }) :
    template(`(${searchFields.join(' or ')})`, { interpolate: /%{([\s\S]+?)}/g });

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
  )(queryParams, pathComponents, newResourceData, logger, props);
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
      resultDensity: 'sparse',
      perRequest: 100,
      path: 'users',
      GET: {
        params: {
          query: buildQuery,
          // Setting `resultOffset` to the `offset` parameter is required to fetch results further than the 10th page (offset > 1000).
          // BE returns `totalRecords` as 1000 even though there are more (this is how it works https://folio-org.atlassian.net/browse/RMB-673)
          // and stripes-connect requests 1000 in the `offset` parameter even when `resultOffset` is more then 1000 as it uses `totalRecords` value.
          // We can get around this by setting `offset` to the `resultOffset` value.
          offset: '%{resultOffset}',
        },
        staticFallback: { params: {} },
      },
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path?.match(/users/));
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: (q, p, r, l, props) => props?.stripes?.config?.maxUnpagedResourceCount || '200',
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

  state = {
    actualTotalRecords: 0,
    hasLoadedActualTotalRecords: false,
  }

  componentDidMount() {
    const {
      resources,
    } = this.props;

    this.source = new StripesConnectedSource(this.props, this.logger);
    if (this.searchField.current) {
      this.searchField.current.focus();
    }

    if (resources.query?.query || resources.query?.filters) {
      this.fetchActualTotalRecords();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      resources,
    } = this.props;

    // Process patron groups
    const pg = (this?.props?.resources?.patronGroups || {})?.records || [];
    if (pg.length) {
      const pgFilterConfig = filterConfig.find(group => group.name === 'pg');
      const oldValuesLength = pgFilterConfig.values.length;
      pgFilterConfig.values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
      if (oldValuesLength === 0) {
        this.props.mutator.initializedFilterConfig.replace(true); // triggers refresh of users
      }
    }

    // Only fetch actual total records if the `query` or `filters` have changed
    if ((resources.query.query && resources.query.query !== prevProps.resources.query.query)
      || (resources.query.filters && resources.query.filters !== prevProps.resources.query.filters)
    ) {
      this.fetchActualTotalRecords();
    }

    this.source.update(this.props);
  }

  resetActualTotalRecords = () => {
    this.setState({
      actualTotalRecords: 0,
      hasLoadedActualTotalRecords: false,
    });
  }

  fetchActualTotalRecords = async () => {
    const {
      okapiKy,
      resources,
    } = this.props;

    const queryParams = { ...resources.query };
    const searchQuery = buildQuery(queryParams, {}, resources, this.logger, this.props);

    if (!searchQuery) return;

    try {
      const response = await okapiKy(`users?limit=0&query=${searchQuery}`);
      const data = await response.json();

      this.setState({
        actualTotalRecords: data.totalRecords,
        hasLoadedActualTotalRecords: true,
      });
    } catch (error) {
      noop();
    }
  }

  onNeedMoreData = (askAmount, index) => {
    const { resultOffset } = this.props.mutator;

    this.fetchActualTotalRecords();

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

    if (resultOffset) {
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
    const {
      actualTotalRecords,
      hasLoadedActualTotalRecords,
    } = this.state;

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
        actualTotalRecords={actualTotalRecords}
        hasLoadedActualTotalRecords={hasLoadedActualTotalRecords}
        onResetActualTotalRecords={this.resetActualTotalRecords}
        {...this.props}
      >
        { this.props.children }
      </UserSearch>
    );
  }
}

export default flowRight(
  withOkapiKy,
)(stripesConnect(UserSearchContainer));
