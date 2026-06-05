import React from 'react';
import PropTypes from 'prop-types';
import {
  cloneDeep,
  get,
  template,
  flowRight,
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
import { MAX_RECORDS, PATRON_GROUP_CHUNK_SIZE, USERS_API } from '../constants';
import filterConfig from './filterConfig';
import { buildFilterConfig, extractPatronGroupIds, stripPatronGroupFilters } from './utils';

const INITIAL_RESULT_COUNT = 100;
const RESULT_COUNT_INCREMENT = 100;

// Split a CQL query string at the last ' sortby ' keyword so we can wrap
// the main part in parentheses before appending a patron-group clause.
const splitCqlSort = (cql) => {
  if (!cql) return { query: '', sortClause: '' };
  const idx = cql.lastIndexOf(' sortby ');
  if (idx === -1) return { query: cql, sortClause: '' };
  return { query: cql.slice(0, idx), sortClause: cql.slice(idx) };
};

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
      perRequest: RESULT_COUNT_INCREMENT,
      path: 'users',
      // Disable the manifest fetch when too many patron groups are selected –
      // the resulting CQL query would exceed URL length limits (HTTP 414).
      // In that situation UserSearchContainer uses chunked okapiKy requests instead.
      fetch: props => {
        const filters = props.resources?.query?.filters || '';
        return extractPatronGroupIds(filters).length <= PATRON_GROUP_CHUNK_SIZE;
      },
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
    okapiKy: PropTypes.func.isRequired,
    resources: PropTypes.shape({
      query: PropTypes.shape({
        query: PropTypes.string,
        filters: PropTypes.arrayOf(PropTypes.object),
      }).isRequired,
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
    // State for chunked-mode fetching (active when patron group count > PATRON_GROUP_CHUNK_SIZE)
    chunkedUsers: [],
    isChunkedFetching: false,
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

    // Trigger initial chunked fetch when the page is loaded with 50+ patron groups
    // already present in the URL (e.g. restored from a bookmark).
    const patronGroupIds = extractPatronGroupIds(resources.query?.filters);
    if (patronGroupIds.length > PATRON_GROUP_CHUNK_SIZE) {
      this.fetchChunkedUsers();
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

    const queryChanged = resources.query.query !== prevProps.resources.query.query;
    const filtersChanged = resources.query.filters !== prevProps.resources.query.filters;
    const sortChanged = resources.query.sort !== prevProps.resources.query.sort;

    const patronGroupIds = extractPatronGroupIds(resources.query?.filters);
    const prevPatronGroupIds = extractPatronGroupIds(prevProps.resources.query?.filters);
    const isChunkedMode = patronGroupIds.length > PATRON_GROUP_CHUNK_SIZE;
    const wasChunkedMode = prevPatronGroupIds.length > PATRON_GROUP_CHUNK_SIZE;

    // Only fetch actual total records if the `query` or `filters` have changed
    if (queryChanged || filtersChanged || sortChanged) {
      if (resources.query?.query || resources.query?.filters) {
        this.fetchActualTotalRecords();
      } else {
        // Reset actual total records if both query and filters are empty and we previously had records
        this.resetActualTotalRecords();
      }
    }

    if (isChunkedMode) {
      if (!wasChunkedMode || queryChanged || filtersChanged || sortChanged) {
        // Entering chunked mode for the first time, or filters/query changed while in chunked mode
        this.fetchChunkedUsers();
      }
    } else if (wasChunkedMode) {
      // Leaving chunked mode – clear chunked state so normal manifest data takes over
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ chunkedUsers: [], isChunkedFetching: false });
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
    const { resources } = this.props;
    const queryParams = { ...resources.query };
    const patronGroupIds = extractPatronGroupIds(queryParams.filters);

    if (patronGroupIds.length > PATRON_GROUP_CHUNK_SIZE) {
      await this.fetchChunkedTotalRecords(patronGroupIds, queryParams);
    } else {
      await this.fetchSingleTotalRecords(queryParams);
    }
  }

  fetchSingleTotalRecords = async (queryParams) => {
    const {
      okapiKy,
      resources,
    } = this.props;
    const searchQuery = buildQuery(queryParams, {}, resources, this.logger, this.props);

    if (!searchQuery) return;

    try {
      const data = await okapiKy(USERS_API, {
        searchParams: {
          limit: 0,
          query: searchQuery,
        },
      }).json();

      this.setState({
        actualTotalRecords: data.totalRecords,
        hasLoadedActualTotalRecords: true,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching actual total records:', error);
    }
  }

  /**
   * Build one CQL query string per chunk of patron group IDs.
   * The sortby clause from the base query is stripped and re-appended after the
   * combined (baseQuery) AND (pg chunk) expression so the CQL remains valid.
   */
  buildChunkedQueries = (patronGroupIds, queryParams) => {
    const { resources } = this.props;
    const filtersWithoutPG = stripPatronGroupFilters(queryParams.filters);
    const baseQueryParams = { ...queryParams, filters: filtersWithoutPG };
    const baseResourceData = { ...resources, query: { ...resources.query, filters: filtersWithoutPG } };

    const fullBaseQuery = buildQuery(baseQueryParams, {}, baseResourceData, this.logger, this.props);
    const query = buildQuery(queryParams, {}, resources, this.logger, this.props);
    // Use original query (with patron group filters) to extract the sort clause,
    // and the base query (without patron group filters) to extract the main query part,
    // so that we can combine the main query with each chunk of patron group filters without losing the sort clause.
    // Sort clause is empty if fullBaseQuery is empty, that's why we use the original query to extract it.
    // fullBaseQuery can be empty when there no query and no filters (we strip patron group filters from the query,
    // so if the only filters are patron groups, the resulting sort clause will be empty).
    const { sortClause } = splitCqlSort(query);
    const { query: baseQuery } = splitCqlSort(fullBaseQuery);

    const queries = [];
    for (let i = 0; i < patronGroupIds.length; i += PATRON_GROUP_CHUNK_SIZE) {
      const chunk = patronGroupIds.slice(i, i + PATRON_GROUP_CHUNK_SIZE);
      const pgCql = chunk.map(id => `patronGroup=="${id}"`).join(' OR ');
      queries.push([baseQuery, `(${pgCql})`].filter(Boolean).join(' AND ') + sortClause);
    }
    return queries;
  }

  fetchChunkedTotalRecords = async (patronGroupIds, queryParams) => {
    const { okapiKy } = this.props;
    const queries = this.buildChunkedQueries(patronGroupIds, queryParams);

    try {
      const results = await Promise.all(
        queries.map(q => okapiKy(USERS_API, { searchParams: { limit: 0, query: q } }).json())
      );
      const totalRecords = results.reduce((sum, r) => sum + (r.totalRecords ?? 0), 0);
      this.setState({ actualTotalRecords: totalRecords, hasLoadedActualTotalRecords: true });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching chunked total records:', error);
    }
  }

  /**
   * Fetch users across all patron-group chunks and merge results.
   * Each chunk is fetched with the same limit and offset so that PREV/NEXT paging
   * works correctly within each chunk. Results are concatenated and stored as a
   * sparse array so MCL can detect page boundaries.
   * Note: because chunks are fetched independently, global sort order across chunk
   * boundaries is not guaranteed – each chunk returns server-sorted results.
   */
  fetchChunkedUsers = async (pageAmount = RESULT_COUNT_INCREMENT, pageIndex = 0) => {
    const {
      okapiKy,
      resources,
    } = this.props;

    const queryParams = { ...resources.query };
    const patronGroupIds = extractPatronGroupIds(queryParams.filters);
    const queries = this.buildChunkedQueries(patronGroupIds, queryParams);

    this.setState({ isChunkedFetching: true });

    try {
      const results = await Promise.all(
        queries.map(q => okapiKy(USERS_API, {
          searchParams: { limit: pageAmount, offset: pageIndex, query: q },
        }).json())
      );

      const allUsers = results.flatMap(r => r.users ?? []);

      this.setState({
        // Prepend empty slots matching the offset so that MultiColumnList can
        // determine when the end of the list is reached and disable Next correctly.
        // This sets `isSparse` to true in MultiColumnList.
        chunkedUsers: new Array(pageIndex).concat(allUsers.slice(0, pageAmount)),
        isChunkedFetching: false,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching chunked users:', error);
      this.setState({ isChunkedFetching: false });
    }
  }

  onNeedMoreDataChunked = (askAmount = RESULT_COUNT_INCREMENT, index = 0) => {
    this.fetchActualTotalRecords();
    this.fetchChunkedUsers(askAmount, index);
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
      chunkedUsers,
      isChunkedFetching,
    } = this.state;

    if (this.source) {
      this.source.update(this.props);
    }

    const patronGroupIds = extractPatronGroupIds(this.props.resources.query?.filters);
    const isChunkedMode = patronGroupIds.length > PATRON_GROUP_CHUNK_SIZE;

    // When chunked mode is active, supply a minimal source-adapter so that
    // components that query source.totalCount() / source.pending() keep working.
    const chunkedSource = isChunkedMode ? {
      totalCount: () => actualTotalRecords,
      pending: () => isChunkedFetching,
      loaded: () => !isChunkedFetching,
      records: () => chunkedUsers,
      fetchMore: this.onNeedMoreDataChunked,
      fetchOffset: this.onNeedMoreDataChunked,
      failure: () => false,
      failureMessage: () => null,
    } : null;

    // Override resources.records so UserSearch reads chunked data instead of the
    // (disabled) manifest resource.
    const chunkedResourcesOverride = isChunkedMode ? {
      ...this.props.resources,
      records: {
        records: chunkedUsers,
        isPending: isChunkedFetching,
        hasLoaded: !isChunkedFetching,
      },
    } : null;

    const chunkProps = isChunkedMode ? {
      source: chunkedSource,
      resources: chunkedResourcesOverride,
      onNeedMoreData: this.onNeedMoreDataChunked,
    } : {};

    return (
      <UserSearch
        source={this.source}
        initialSearch="?sort=name"
        onNeedMoreData={this.onNeedMoreData}
        queryGetter={this.queryGetter}
        querySetter={this.querySetter}
        actualTotalRecords={actualTotalRecords}
        hasLoadedActualTotalRecords={hasLoadedActualTotalRecords}
        {...this.props}
        {...chunkProps}
      >
        { this.props.children }
      </UserSearch>
    );
  }
}

export default flowRight(
  withOkapiKy,
)(stripesConnect(UserSearchContainer));
