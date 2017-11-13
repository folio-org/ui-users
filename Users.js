import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { filters2cql } from '@folio/stripes-components/lib/FilterGroups';
// eslint-disable-next-line import/no-unresolved
import { stripesShape } from '@folio/stripes-core/src/Stripes';

import SearchAndSort from './lib/SearchAndSort';
import packageInfo from './package';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const filterConfig = [
  {
    label: 'Status',
    name: 'active',
    cql: 'active',
    values: [
      { name: 'Active', cql: 'true' },
      { name: 'Inactive', cql: 'false' },
    ],
  },
  {
    label: 'Patron group',
    name: 'pg',
    cql: 'patronGroup',
    values: [], // will be filled in by componentWillUpdate
  },
];

class Users extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    mutator: PropTypes.shape({}).isRequired,
    okapi: PropTypes.shape({}).isRequired,
    onSelectRow: PropTypes.func,
  };

  static manifest = Object.freeze({
    query: {
      initialValue: {
        search: '',
        filters: 'active.Active',
        sort: 'Name',
      },
    },
    userCount: { initialValue: INITIAL_RESULT_COUNT },
    users: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{userCount}',
      perRequest: 30,
      path: 'users',
      GET: {
        params: {
          query: (...args) => {
            /*
              This code is not DRY as it is copied from makeQueryFunction in stripes-components.
              This is necessary, as makeQueryFunction only referneces query paramaters as a data source.
              STRIPES-480 is intended to correct this and allow this query function to be replace with a call
              to makeQueryFunction.
              https://issues.folio.org/browse/STRIPES-480
            */
            const resourceData = args[2];
            const sortMap = {
              Active: 'active',
              Name: 'personal.lastName personal.firstName',
              'Patron Group': 'patronGroup.group',
              Username: 'username',
              Barcode: 'barcode',
              Email: 'personal.email',
            };

            let cql = `(username="${resourceData.query.search}*" or personal.firstName="${resourceData.query.search}*" or personal.lastName="${resourceData.query.search}*" or personal.email="${resourceData.query.search}*" or barcode="${resourceData.query.search}*" or id="${resourceData.query.search}*" or externalSystemId="${resourceData.query.search}*")`;

            const filterCql = filters2cql(filterConfig, resourceData.query.filters);
            if (filterCql) {
              if (cql) {
                cql = `(${cql}) and ${filterCql}`;
              } else {
                cql = filterCql;
              }
            }

            const { sort } = resourceData.query;
            if (sort) {
              const sortIndexes = sort.split(',').map((sort1) => {
                let reverse = false;
                if (sort1.startsWith('-')) {
                  // eslint-disable-next-line no-param-reassign
                  sort1 = sort1.substr(1);
                  reverse = true;
                }
                let sortIndex = sortMap[sort1] || sort1;
                if (reverse) {
                  sortIndex = `${sortIndex.replace(' ', '/sort.descending ')}/sort.descending`;
                }
                return sortIndex;
              });

              cql += ` sortby ${sortIndexes.join(' ')}`;
            }

            return cql;
          },
        },
        staticFallback: { params: {} },
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
    },
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      records: 'addressTypes',
    },
  });

  constructor(props) {
    super(props);
    this.connectedSearchAndSort = props.stripes.connect(SearchAndSort);
  }

  componentWillUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];
    if (pg && pg.length) {
      filterConfig[1].values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
    }
  }

  render() {
    const props = this.props;
    const urlQuery = queryString.parse(props.location.search || '');
    const initialPath = (_.get(packageInfo, ['stripes', 'home']) ||
                         _.get(packageInfo, ['stripes', 'route']));


    return (<this.connectedSearchAndSort
      stripes={props.stripes}
      okapi={this.props.okapi}
      initialPath={initialPath}
      filterConfig={filterConfig}
      initialResultCount={INITIAL_RESULT_COUNT}
      resultCountIncrement={RESULT_COUNT_INCREMENT}
      parentResources={this.props.resources}
      parentMutator={this.props.mutator}
      onSelectRow={this.props.onSelectRow}
      path={this.props.location.pathname}
      urlQuery={urlQuery}
    />);
  }
}

export default Users;
