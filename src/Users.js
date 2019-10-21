import { get, template } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import moment from 'moment';

import { Button } from '@folio/stripes/components';
import { makeQueryFunction, SearchAndSort } from '@folio/stripes/smart-components';
import { AppIcon, stripesConnect, withStripes } from '@folio/stripes/core';

import uuid from 'uuid';
import ViewUser from './ViewUser';
import UserForm from './UserForm';
import { toUserAddresses } from './converters/address';
import { getFullName } from './util';
import packageInfo from '../package';
import { HasCommand } from './components/Commander';
import OverdueLoanReport from './reports';

import usersStyles from './Users.css';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;
const LIMIT_MAX = 2147483647;

const filterConfig = [
  {
    label: <FormattedMessage id="ui-users.status" />,
    name: 'active',
    cql: 'active',
    values: [
      {
        name: 'inactive',
        cql: 'false',
        displayName: <FormattedMessage id="ui-users.inactive" />,
      },
      {
        name: 'active',
        cql: 'true',
        displayName: <FormattedMessage id="ui-users.active" />,
      },
    ],
  },
  {
    label: <FormattedMessage id="ui-users.information.patronGroup" />,
    name: 'pg',
    cql: 'patronGroup',
    values: [], // will be filled in by componentDidUpdate
  },
];

const compileQuery = template(
  '(username="%{query}*" or personal.firstName="%{query}*" or personal.lastName="%{query}*" or personal.email="%{query}*" or barcode="%{query}*" or id="%{query}*" or externalSystemId="%{query}*")',
  { interpolate: /%{([\s\S]+?)}/g }
);

const getLoansOverdueDate = () => moment().tz('UTC').format();

class Users extends React.Component {
  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: { sort: 'name' } },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    records: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{resultCount}',
      perRequest: 30,
      path: 'users',
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            // TODO: Refactor/remove this after work on FOLIO-2066 and RMB-385 is done
            (parsedQuery, props, localProps) => localProps.query.query.trim().split(/\s+/).map(query => compileQuery({ query })).join(' and '),
            {
              // the keys in this object must match those passed to
              // SearchAndSort's columnMapping prop
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
    creds: {
      type: 'okapi',
      path: 'authn/credentials',
      fetch: false,
    },
    perms: {
      type: 'okapi',
      path: 'perms/users',
      fetch: false,
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '40',
      },
      records: 'usergroups',
    },
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes?query=cql.allRecords=1 sortby desc',
      records: 'addressTypes',
    },
    uniquenessValidator: {
      type: 'okapi',
      records: 'users',
      accumulate: true,
      path: 'users',
      fetch: false,
    },
    loans: {
      type: 'okapi',
      records: 'loans',
      accumulate: true,
      path: () => `circulation/loans?limit=${LIMIT_MAX}&query=(status="Open" and dueDate < ${getLoansOverdueDate()})`,
      permissionsRequired: 'circulation.loans.collection.get,accounts.collection.get',
    }
  });

  static propTypes = {
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loans: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      creds: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      initializedFilterConfig: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
      perms: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      records: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
    onSelectRow: PropTypes.func,
    onComponentWillUnmount: PropTypes.func,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
    disableRecordCreation: PropTypes.bool,
    showSingleResult: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    browseOnly: PropTypes.bool,
    intl: intlShape.isRequired,
    packageInfo: PropTypes.object,
  };

  static defaultProps = {
    showSingleResult: true,
    browseOnly: false,
  }

  constructor(props) {
    super(props);

    this.state = {
      exportInProgress: false,
    };

    this.keyboardCommands = [
      {
        name: 'new',
        handler: this.goToNew
      },
      {
        name: 'search',
        handler: this.goToSearch
      }
    ];

    const { formatMessage } = props.intl;

    this.overdueLoanReport = new OverdueLoanReport({
      formatMessage
    });
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
  }

  // XXX something prevents exceptions in this function from being received: see STRIPES-483
  create = (userdata) => {
    const { mutator } = this.props;
    if (userdata.username) {
      const creds = Object.assign({}, userdata.creds, { username: userdata.username }, userdata.creds.password ? {} : { password: '' });
      const user = Object.assign({}, userdata, { id: uuid() });
      if (user.creds) delete user.creds;

      mutator.records.POST(user)
        .then(newUser => mutator.creds.POST(Object.assign(creds, { userId: newUser.id })))
        .then(newCreds => mutator.perms.POST({ userId: newCreds.userId, permissions: [] }))
        .then((perms) => {
          mutator.query.update({ _path: `/users/view/${perms.userId}`, layer: null });
        });
    } else {
      const user = Object.assign({}, userdata, { id: uuid() });
      if (user.creds) delete user.creds;

      mutator.records.POST(user)
        .then((newUser) => mutator.perms.POST({ userId: newUser.id, permissions: [] }))
        .then((perms) => {
          mutator.query.update({ _path: `/users/view/${perms.userId}`, layer: null });
        });
    }
  }

  massageNewRecord = (userdata) => {
    if (userdata.personal.addresses) {
      const addressTypes = (this.props.resources.addressTypes || {}).records || [];
      // eslint-disable-next-line no-param-reassign
      userdata.personal.addresses = toUserAddresses(userdata.personal.addresses, addressTypes);
    }
  }

  goToNew = () => {
    const { mutator } = this.props;
    mutator.query.update({ layer: 'create' });
  }

  goToSearch = () => {
    const { mutator } = this.props;
    mutator.query.update({ layer: null });
    const searchField = document.getElementById('input-user-search');
    if (searchField) {
      searchField.focus();
    }
  }

  generateOverdueLoanReport = props => {
    const {
      reset,
      GET,
    } = props.mutator.loans;
    const { exportInProgress } = this.state;

    if (exportInProgress) {
      return;
    }

    this.setState({ exportInProgress: true }, () => {
      reset();
      GET()
        .then(loans => this.overdueLoanReport.toCSV(loans))
        .then(this.setState({ exportInProgress: false }));
    });
  }

  getActionMenu = ({ onToggle }) => (
    <Button
      buttonStyle="dropdownItem"
      id="export-overdue-loan-report"
      onClick={() => {
        onToggle();
        this.generateOverdueLoanReport(this.props);
      }}
    >
      <FormattedMessage id="ui-users.reports.overdue.label" />
    </Button>
  );

  render() {
    const {
      onSelectRow,
      disableRecordCreation,
      onComponentWillUnmount,
      showSingleResult,
      browseOnly,
      intl,
    } = this.props;

    const patronGroups = (this.props.resources.patronGroups || {}).records || [];

    const resultsFormatter = {
      active: user => (
        <AppIcon
          app="users"
          size="small"
          className={user.active ? '' : usersStyles.inactiveAppIcon}
        >
          {
            user.active
              ? <FormattedMessage id="ui-users.active" />
              : <FormattedMessage id="ui-users.inactive" />
          }
        </AppIcon>
      ),
      name: user => getFullName(user),
      barcode: user => user.barcode,
      patronGroup: (user) => {
        const pg = patronGroups.filter(g => g.id === user.patronGroup)[0];
        return pg ? pg.group : '?';
      },
      username: user => user.username,
      email: user => get(user, 'personal.email'),
    };

    return (
      <div data-test-user-instances>
        <HasCommand commands={this.keyboardCommands}>
          <SearchAndSort
            packageInfo={this.props.packageInfo || packageInfo}
            actionMenu={this.getActionMenu}
            objectName="user"
            filterConfig={filterConfig}
            initialResultCount={INITIAL_RESULT_COUNT}
            resultCountIncrement={RESULT_COUNT_INCREMENT}
            viewRecordComponent={ViewUser}
            editRecordComponent={UserForm}
            newRecordInitialValues={{ active: true, personal: { preferredContactTypeId: '002' } }}
            visibleColumns={this.props.visibleColumns ? this.props.visibleColumns : ['active', 'name', 'barcode', 'patronGroup', 'username', 'email']}
            resultsFormatter={resultsFormatter}
            onSelectRow={onSelectRow}
            onCreate={this.create}
            onComponentWillUnmount={onComponentWillUnmount}
            massageNewRecord={this.massageNewRecord}
            finishedResourceName="perms"
            viewRecordPerms="users.item.get"
            newRecordPerms="users.item.post,login.item.post,perms.users.item.post"
            disableRecordCreation={disableRecordCreation}
            parentResources={this.props.resources}
            parentMutator={this.props.mutator}
            showSingleResult={showSingleResult}
            columnMapping={{
              active: intl.formatMessage({ id: 'ui-users.status' }),
              name: intl.formatMessage({ id: 'ui-users.information.name' }),
              barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
              patronGroup: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
              username: intl.formatMessage({ id: 'ui-users.information.username' }),
              email: intl.formatMessage({ id: 'ui-users.contact.email' }),
            }}
            browseOnly={browseOnly}
          />
        </HasCommand>
      </div>);
  }
}

export default injectIntl(withStripes(stripesConnect(Users)));
