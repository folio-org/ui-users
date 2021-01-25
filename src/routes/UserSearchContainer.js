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
} from '@folio/stripes/smart-components';

import filterConfig from './filterConfig';
import { UserSearch } from '../views';
import { MAX_RECORDS } from '../constants';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const compileQuery = template(
  '(username="%{query}*" or personal.firstName="%{query}*" or personal.preferredFirstName="%{query}*" or personal.lastName="%{query}*" or personal.email="%{query}*" or barcode="%{query}*" or id="%{query}*" or externalSystemId="%{query}*")',
  { interpolate: /%{([\s\S]+?)}/g }
);

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
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            // TODO: Refactor/remove this after work on FOLIO-2066 and RMB-385 is done
            (parsedQuery, props, localProps) => localProps.query.query.trim().replace('*', '').split(/\s+/)
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
            filterConfig,
            2,
          ),
        },
        staticFallback: { params: {} },
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
      path: 'departments',
      records: 'departments',
    },
    owners: {
      type: 'okapi',
      records: 'owners',
      path: `owners?query=cql.allRecords=1&limit=${MAX_RECORDS}`,
    },
    refundsReport: {
      type: 'okapi',
      records: 'reportData',
      path: 'feefine-reports/refund',
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
    const { location : locationProp, history } = this.props;
    if (nsValues.query) {
      nsValues.query = nsValues.query.replace('*', '');
    }
    let location = locationProp;
    // modifying the location hides the user detail view if a search/filter is triggered.
    if (state.changeType !== 'init.reset' && !location.pathname.endsWith('users')) {
      const pathname = '/users';
      location = { ...locationProp, pathname };
    }

    const url = buildUrl(location, nsValues);
    history.push(url);
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
