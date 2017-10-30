import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
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
    userCount: { initialValue: INITIAL_RESULT_COUNT },
    users: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{userCount}',
      perRequest: 30,
      path: 'users',
      GET: {
        params: {
          query: makeQueryFunction(
            'username=*',
            'username="$QUERY*" or personal.firstName="$QUERY*" or personal.lastName="$QUERY*" or personal.email="$QUERY*" or barcode="$QUERY*" or id="$QUERY*" or externalSystemId="$QUERY*"',
            {
              Status: 'active',
              Name: 'personal.lastName personal.firstName',
              'Patron Group': 'patronGroup.group',
              Username: 'username',
              Barcode: 'barcode',
              Email: 'personal.email',
            },
            filterConfig,
          ),
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
    this.anchoredRowFormatter = this.anchoredRowFormatter.bind(this);
  }

  componentWillUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];
    if (pg && pg.length) {
      filterConfig[1].values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
    }
  }

  getRowURL(rowData) {
    return `/users/view/${rowData.id}${this.props.location.search}`;
  }

  // custom row formatter to wrap rows in anchor tags.
  anchoredRowFormatter(
    { rowIndex,
      rowClass,
      rowData,
      cells,
      rowProps,
      labelStrings,
    },
  ) {
    return (
      <a
        href={this.getRowURL(rowData)} key={`row-${rowIndex}`}
        aria-label={labelStrings && labelStrings.join('...')}
        role="listitem"
        className={rowClass}
        {...rowProps}
      >
        {cells}
      </a>
    );
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
      parentResources={props.resources}
      parentMutator={this.props.mutator}
      onSelectRow={this.props.onSelectRow}
      path={props.location.pathname}
      urlQuery={urlQuery}
    />);
  }
}

export default Users;
