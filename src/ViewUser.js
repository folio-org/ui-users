import moment from 'moment';
import { cloneDeep, get, omit, differenceBy, find, isArray } from 'lodash';
import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import queryString from 'query-string';
import {
  AppIcon,
  IfInterface,
  IfPermission,
  TitleManager,
} from '@folio/stripes/core';
import {
  Button,
  Pane,
  PaneMenu,
  PaneHeaderIconButton,
  Icon,
  ExpandAllButton,
  Row,
  Col,
  Layer,
  Headline,
  AccordionSet,
  expandAllFunction,
} from '@folio/stripes/components';

import {
  withTags,
  NotesSmartAccordion,
} from '@folio/stripes/smart-components';

import UserForm from './UserForm';
import LoansHistory from './LoansHistory';
import LoanActionsHistory from './LoanActionsHistory';

import { ChargeFeeFine } from './components/Accounts';
import AccountsHistory from './AccountsHistory';
import AccountActionsHistory from './AccountActionsHistory';
import { PatronBlockLayer, PatronBlockMessage } from './components/PatronBlock';
import { toListAddresses, toUserAddresses } from './converters/address';
import { getFullName, eachPromise } from './util';
import withProxy from './withProxy';
import withServicePoints from './withServicePoints';
import { HasCommand } from './components/Commander';

import {
  UserInfo,
  ExtendedInfo,
  ContactInfo,
  ProxyPermissions,
  PatronBlock,
  UserPermissions,
  UserLoans,
  UserRequests,
  UserAccounts,
  UserServicePoints,
} from './components/ViewSections';

class ViewUser extends React.Component {
  static manifest = Object.freeze({
    query: {},
    selUser: {
      type: 'okapi',
      path: 'users/:{id}',
      clear: false,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
    },
    hasPatronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=(userId=:{id})&limit=100',
      permissionsRequired: 'manualblocks.collection.get',
    },
    loansHistory: {
      type: 'okapi',
      records: 'loans',
      path: 'circulation/loans?query=(userId=:{id}) sortby id&limit=100',
      permissionsRequired: 'circulation.loans.collection.get',
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
    // NOTE: 'indexField', used as a parameter in the userPermissions paths,
    // modifies the API call so that the :{userid} parameter is actually
    // interpreted as a user ID. By default, that path component is taken as
    // the ID of the user/permission _object_ in /perms/users.
    permissions: {
      type: 'okapi',
      records: 'permissionNames',
      throwErrors: false,
      DELETE: {
        pk: 'permissionName',
        path: 'perms/users/:{id}/permissions',
        params: { indexField: 'userId' },
      },
      GET: {
        path: 'perms/users/:{id}/permissions',
        params: { full: 'true', indexField: 'userId' },
      },
      path: 'perms/users/:{id}/permissions',
      params: { indexField: 'userId' },
    },
    settings: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module==USERS and configName==profile_pictures)',
    },
  });

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      locale: PropTypes.string.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    paneWidth: PropTypes.string.isRequired,
    resources: PropTypes.shape({
      user: PropTypes.arrayOf(PropTypes.object),
      permissions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      query: PropTypes.object,
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      settings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      selUser: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
      permissions: PropTypes.shape({
        POST: PropTypes.func.isRequired,
        DELETE: PropTypes.func.isRequired,
      }),
      query: PropTypes.object.isRequired,
    }),
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
      params: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
    onClose: PropTypes.func,
    onEdit: PropTypes.func,
    editLink: PropTypes.string,
    onCloseEdit: PropTypes.func,
    tagsToggle: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
    parentResources: PropTypes.shape({
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    parentMutator: PropTypes.shape({}),
    updateProxies: PropTypes.func,
    updateServicePoints: PropTypes.func,
    updateSponsors: PropTypes.func,
    getSponsors: PropTypes.func,
    getProxies: PropTypes.func,
    getServicePoints: PropTypes.func,
    getPreferredServicePoint: PropTypes.func,
    tagsEnabled: PropTypes.bool,
    okapi: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      viewOpenLoansMode: true,
      selectedLoan: {},
      selectedAccount: {},
      selectedPatronBlock: {},
      addRecord: false,
      lastUpdate: null,
      sections: {
        userInformationSection: true,
        extendedInfoSection: false,
        contactInfoSection: false,
        proxySection: false,
        patronBlocksSection: false,
        loansSection: false,
        requestsSection: false,
        accountsSection: false,
        permissionsSection: false,
        servicePointsSection: false,
        notesAccordion: false,
      },
    };

    this.connectedUserLoans = props.stripes.connect(UserLoans);
    this.connectedUserRequests = props.stripes.connect(UserRequests);
    this.connectedUserAccounts = props.stripes.connect(UserAccounts);
    this.connectedPatronBlock = props.stripes.connect(PatronBlock);
    this.connectedLoansHistory = props.stripes.connect(LoansHistory);
    this.connectedLoanActionsHistory = props.stripes.connect(LoanActionsHistory);
    this.connectedUserInfo = props.stripes.connect(UserInfo);
    this.dateLastUpdated = this.dateLastUpdated.bind(this);
    this.onClickCloseLoansHistory = this.onClickCloseLoansHistory.bind(this);
    this.onClickViewOpenLoans = this.onClickViewOpenLoans.bind(this);
    this.onClickViewClosedLoans = this.onClickViewClosedLoans.bind(this);
    this.onClickViewLoanActionsHistory = this.onClickViewLoanActionsHistory.bind(this);
    this.buildRecords = this.buildRecords.bind(this);
    this.onClickCloseLoanActionsHistory = this.onClickCloseLoanActionsHistory.bind(this);
    this.onAddressesUpdate = this.onAddressesUpdate.bind(this);
    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.handleExpandAll = this.handleExpandAll.bind(this);
    this.collapseAllSections = this.collapseAllSections.bind(this);
    this.expandAllSections = this.expandAllSections.bind(this);
    this.toggleAllSections = this.toggleAllSections.bind(this);

    this.connectedCharge = props.stripes.connect(ChargeFeeFine);
    this.onCloseChargeFeeFine = this.onCloseChargeFeeFine.bind(this);
    this.onClickViewChargeFeeFine = this.onClickViewChargeFeeFine.bind(this);
    this.handleAddRecords = this.handleAddRecords.bind(this);
    this.connectedAccountsHistory = props.stripes.connect(AccountsHistory);
    this.connectedAccountActionsHistory = props.stripes.connect(AccountActionsHistory);
    this.onClickViewOpenAccounts = this.onClickViewOpenAccounts.bind(this);
    this.onClickViewClosedAccounts = this.onClickViewClosedAccounts.bind(this);
    this.onClickViewAllAccounts = this.onClickViewAllAccounts.bind(this);
    this.onClickCloseAccountsHistory = this.onClickCloseAccountsHistory.bind(this);
    this.onClickViewAccountActionsHistory = this.onClickViewAccountActionsHistory.bind(this);
    this.onClickCloseAccountActionsHistory = this.onClickCloseAccountActionsHistory.bind(this);
    this.connectedPatronBlockLayer = props.stripes.connect(PatronBlockLayer);
    this.onClickViewPatronBlock = this.onClickViewPatronBlock.bind(this);
    this.onClickClosePatronBlock = this.onClickClosePatronBlock.bind(this);
    this.showCallout = null;

    this.editButton = React.createRef();

    this.keyboardCommands = [
      {
        name: 'edit',
        handler: this.goToEdit,
      },
      {
        name: 'collapseAllSections',
        handler: this.collapseAllSections,
      },
      {
        name: 'expandAllSections',
        handler: this.expandAllSections,
      },
    ];
  }

  static getDerivedStateFromProps(nextProps) {
    const query = nextProps.location.search ? queryString.parse(nextProps.location.search) : {};

    if (query.loan) {
      const loansHistory = (nextProps.resources.loansHistory || {}).records || [];
      if (loansHistory.length) {
        const selectedLoan = find(loansHistory, { id: query.loan });

        if (selectedLoan) {
          return { selectedLoan };
        }
      }
    }

    return null;
  }

  onAddressesUpdate(addresses) {
    const user = this.getUser();
    if (!user) return;
    user.personal.addresses = addresses;
    this.update(user);
  }

  onClickCloseLoanActionsHistory(e) {
    if (e) e.preventDefault();
    const layer = this.state.viewOpenLoansMode ? 'open-loans' : 'closed-loans';
    this.props.mutator.query.update({ layer, loan: null });
    this.setState({
      selectedLoan: {},
    });
  }

  onClickCloseLoansHistory(e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: null });
  }

  onClickViewClosedLoans(e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: 'closed-loans' });
    this.setState({
      viewOpenLoansMode: false,
    });
  }

  buildRecords(records) {
    return records.map((record) => {
      const {
        item,
        item: { contributors },
      } = record;

      return isArray(contributors) ?
        {
          ...record,
          item: {
            ...item,
            contributors: contributors
              .map((currentContributor) => currentContributor.name)
              .join('; ')
          }
        } : record;
    });
  }

  onClickViewLoanActionsHistory(e, selectedLoan) {
    if (e) e.preventDefault();
    const q = {};
    Object.keys(this.props.resources.query).forEach((k) => { q[k] = null; });
    this.props.mutator.query.update({ layer: 'loan', loan: selectedLoan.id });
    this.setState({
      selectedLoan,
    });
  }

  onClickViewOpenLoans(e) {
    if (e) e.preventDefault();

    const q = {};
    Object.keys(this.props.resources.query).forEach((k) => { q[k] = null; });
    this.props.mutator.query.update({ layer: 'open-loans' });
    this.setState({
      viewOpenLoansMode: true,
    });
  }

  onClickViewOpenAccounts(e, selectedLoan = {}) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: 'open-accounts', loan: selectedLoan.id });
  }

  onClickViewClosedAccounts(e, selectedLoan = {}) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: 'closed-accounts', loan: selectedLoan.id });
  }

  onClickViewAllAccounts(e, selectedLoan = {}) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: 'all-accounts', loan: selectedLoan.id });
  }

  onClickCloseAccountsHistory(e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: null, f: null, q: null, loan: null });
  }

  onClickViewAccountActionsHistory(e, selectedAccount) {
    if (e) e.preventDefault();
    const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};
    this.setState({
      prevLayer: query.layer,
    });
    this.props.mutator.query.update({ layer: 'account', account: selectedAccount.id });
    this.setState({
      selectedAccount,
    });
  }

  onClickCloseAccountActionsHistory(e) {
    if (e) e.preventDefault();
    const layer = this.state.prevLayer;
    this.props.mutator.query.update({ layer, account: null });
    this.setState({
      selectedAccount: {},
    });
  }

  onClickViewChargeFeeFine(e, selectedLoan) {
    if (e) e.preventDefault();
    const { layer } = this.props.resources.query;
    this.setState({
      prevLayer: (layer !== 'charge') ? layer : null,
      selectedLoan,
    });
    this.props.mutator.query.update({ layer: 'charge' });
  }

  onCloseChargeFeeFine(e) {
    if (e) e.preventDefault();
    const layer = this.state.prevLayer;

    this.setState({
      selectedLoan: {},
    });

    this.props.mutator.query.update({ layer: layer || null });
  }

  onClickViewPatronBlock(e, mode, selectedPatronBlock) {
    if (e) e.preventDefault();
    const layer = (mode === 'add') ? 'add-block' : 'edit-block';
    if (mode === 'add') {
      this.setState({
        selectedPatronBlock,
      });
      this.props.mutator.query.update({ layer });
    } else {
      this.setState({
        selectedPatronBlock,
      });
      this.props.mutator.query.update({ layer, block: selectedPatronBlock.id });
    }
  }

  onClickClosePatronBlock(e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: null, block: null });
    this.setState({
      selectedPatronBlock: {},
    });
  }

  handleAddRecords() {
    const add = this.state.addRecord;
    this.setState({
      addRecord: !add
    });
  }

  checkScope = () => {
    return document.getElementById('ModuleContainer').contains(document.activeElement);
  };

  getUser() {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];

    if (selUser.length === 0 || !id) return null;
    // Logging below shows this DOES sometimes find the wrong record. But why?
    // console.log(`getUser: found ${selUser.length} users, id '${selUser[0].id}' ${selUser[0].id === id ? '==' : '!='} '${id}'`);
    return selUser.find(u => u.id === id);
  }

  getUserFormData(user, addresses, sponsors, proxies, permissions, servicePoints, preferredServicePoint) {
    const userFormData = user ? cloneDeep(user) : user;
    userFormData.personal.addresses = addresses;
    Object.assign(userFormData, {
      sponsors,
      proxies,
      permissions,
      servicePoints,
      preferredServicePoint,
    });

    return userFormData;
  }

  // This is a helper function for the "last updated" date element. Since the
  // date/time is actually set on the server when the record is updated, the
  // lastUpdated element of the record on the client side might contain a stale
  // value. If so, this returns a locally stored update date until the data
  // is refreshed.
  dateLastUpdated(user) {
    const updatedDateRec = get(user, ['updatedDate'], '');
    const updatedDateLocal = this.state.lastUpdate;

    if (!updatedDateRec) { return ''; }

    let dateToShow;
    if (updatedDateLocal && updatedDateLocal > updatedDateRec) {
      dateToShow = updatedDateLocal;
    } else {
      dateToShow = updatedDateRec;
    }

    return new Date(dateToShow).toLocaleString(this.props.stripes.locale);
  }

  handleExpandAll(obj) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections = obj;
      return newState;
    });
  }

  handleSectionToggle({ id }) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];
      return newState;
    });
  }

  toggleAllSections(expand) {
    this.setState((curState) => {
      const newSections = expandAllFunction(curState.sections, expand);
      return {
        sections: newSections
      };
    });
  }

  expandAllSections(e) {
    e.preventDefault();
    this.toggleAllSections(true);
  }

  collapseAllSections(e) {
    e.preventDefault();
    this.toggleAllSections(false);
  }

  update(user) {
    const addressTypes = (this.props.parentResources.addressTypes || {}).records || [];
    const userData = cloneDeep(user);

    if (userData.personal.addresses) {
      userData.personal.addresses = toUserAddresses(userData.personal.addresses, addressTypes); // eslint-disable-line no-param-reassign
    }

    const {
      proxies,
      sponsors,
      permissions,
      servicePoints,
      preferredServicePoint,
    } = userData;

    if (this.props.stripes.hasPerm('proxiesfor.item.put,proxiesfor.item.post')) {
      if (proxies) this.props.updateProxies(proxies);
      if (sponsors) this.props.updateSponsors(sponsors);
    }

    if (permissions) {
      this.updatePermissions(permissions);
    }

    if (servicePoints && this.props.stripes.hasPerm('inventory-storage.service-points-users.item.post,inventory-storage.service-points-users.item.put')) {
      this.props.updateServicePoints(servicePoints, preferredServicePoint);
    }

    const data = omit(userData, ['creds', 'proxies', 'sponsors', 'permissions', 'servicePoints', 'preferredServicePoint']);
    const today = moment().endOf('day');

    data.active = (moment(userData.expirationDate).endOf('day').isSameOrAfter(today));

    this.props.mutator.selUser.PUT(data).then(() => {
      this.setState({
        lastUpdate: new Date().toISOString(),
      });
      this.props.onCloseEdit();
    });
  }

  updatePermissions(perms) {
    const mutator = this.props.mutator.permissions;
    const prevPerms = (this.props.resources.permissions || {}).records || [];
    const removedPerms = differenceBy(prevPerms, perms, 'id');
    const addedPerms = differenceBy(perms, prevPerms, 'id');
    eachPromise(addedPerms, mutator.POST);
    eachPromise(removedPerms, mutator.DELETE);
  }

  goToEdit = () => {
    this.props.onEdit();
  };

  // focus management when edit layer closes (refocus edit button)
  afterCloseEdit = () => {
    if (this.editButton.current) {
      this.editButton.current.focus();
    }
  };

  isLayerOpen = value => {
    const { location: { search } } = this.props;
    const query = queryString.parse(search || '');
    const { layer } = query;
    return layer === value;
  };

  getPatronGroup(user) {
    const { resources } = this.props;
    const patronGroups = (resources.patronGroups || {}).records || [];
    const patronGroupId = get(user, ['patronGroup'], '');
    return patronGroups.find(g => g.id === patronGroupId) || { group: '' };
  }

  renderLayer(user) {
    const {
      resources,
      stripes,
      parentResources,
      parentMutator,
      mutator,
      location,
      history,
      okapi: { currentUser },
      onCloseEdit,
    } = this.props;

    const query = queryString.parse(location.search || '');
    const permissions = (resources.permissions || {}).records || [];
    const loans = (resources.loansHistory || {}).records || [];
    const sponsors = this.props.getSponsors();
    const proxies = this.props.getProxies();
    const servicePoints = this.props.getServicePoints();
    const preferredServicePoint = this.props.getPreferredServicePoint();
    const addressTypes = (parentResources.addressTypes || {}).records || [];
    const addresses = toListAddresses(get(user, ['personal', 'addresses'], []), addressTypes);

    const patronGroup = this.getPatronGroup(user);
    const userFormData = this.getUserFormData(user, addresses, sponsors, proxies, permissions, servicePoints, preferredServicePoint);
    const patronBlocks = get(resources, ['hasPatronBlocks', 'records'], []);

    if (this.isLayerOpen('add-block') || this.isLayerOpen('edit-block')) {
      return (
        <FormattedMessage id={query.layer === 'add-block' ? 'ui-users.blocks.layer.add' : 'ui-users.blocks.layer.edit'}>
          {contentLabel => (
            <Layer isOpen contentLabel={contentLabel}>
              <this.connectedPatronBlockLayer
                stripes={stripes}
                query={query}
                user={user}
                selectedPatronBlock={this.state.selectedPatronBlock}
                handleAddRecords={this.handleAddRecords}
                onCancel={this.onClickClosePatronBlock}
              />
            </Layer>
          )}
        </FormattedMessage>
      );
    }

    if (this.isLayerOpen('open-accounts') || this.isLayerOpen('closed-accounts') || this.isLayerOpen('all-accounts')) {
      return (
        <FormattedMessage id="ui-users.accounts.title">
          {contentLabel => (
            <Layer isOpen contentLabel={contentLabel}>
              <this.connectedAccountsHistory
                loans={loans}
                num={(this.state.addRecord ? 51 : 50)}
                onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
                user={user}
                currentUser={currentUser}
                parentMutator={mutator}
                patronGroup={patronGroup}
                stripes={stripes}
                history={history}
                addRecord={this.state.addRecord}
                handleAddRecords={this.handleAddRecords}
                location={location}
                onCancel={this.onClickCloseAccountsHistory}
                onClickViewChargeFeeFine={this.onClickViewChargeFeeFine}
                onClickViewAccountActionsHistory={this.onClickViewAccountActionsHistory}
                onClickCloseAccountActionsHistory={this.onClickCloseAccountActionsHistory}
              />
            </Layer>
          )}
        </FormattedMessage>
      );
    }

    if (this.isLayerOpen('charge')) {
      return (
        <FormattedMessage id="ui-users.chargeFeefine">
          {contentLabel => (
            <Layer isOpen contentLabel={contentLabel}>
              <this.connectedCharge
                servicePoints={currentUser.servicePoints}
                preferredServicePoint={currentUser.curServicePoint}
                stripes={stripes}
                onCloseChargeFeeFine={this.onCloseChargeFeeFine}
                user={user}
                currentUser={currentUser}
                loan={{ item: {} }}
                parentResources={resources}
                selectedLoan={this.state.selectedLoan}
                handleAddRecords={this.handleAddRecords}
              />
            </Layer>
          )}
        </FormattedMessage>
      );
    }

    if (this.isLayerOpen('account')) {
      return (
        <FormattedMessage id="ui-users.accountActionHistory">
          {contentLabel => (
            <Layer
              isOpen={this.isLayerOpen('account')}
              contentLabel={contentLabel}
            >
              <this.connectedAccountActionsHistory
                user={user}
                currentUser={currentUser}
                patronGroup={patronGroup}
                account={this.state.selectedAccount}
                accountid={this.state.selectedAccount.id}
                history={history}
                onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
                num={(this.state.addRecord ? 2 : 1)}
                handleAddRecords={this.handleAddRecords}
                stripes={stripes}
                onCancel={this.onClickCloseAccountActionsHistory}
                // when navigating away to another user, clear all loan-related state
                onClickUser={() => { this.onClickCloseAccountActionsHistory(); this.onClickCloseAccountsHistory(); }}
              />
            </Layer>
          )}
        </FormattedMessage>
      );
    }

    if (this.isLayerOpen('open-loans') || this.isLayerOpen('closed-loans')) {
      return (
        <IfPermission perm="ui-users.loans.all">
          <FormattedMessage id="ui-users.loans.title">
            {contentLabel => (
              <Layer
                isOpen
                contentLabel={contentLabel}
              >
                <this.connectedLoansHistory
                  buildRecords={this.buildRecords}
                  user={user}
                  loansHistory={loans}
                  patronGroup={patronGroup}
                  patronBlocks={patronBlocks}
                  stripes={stripes}
                  history={history}
                  onCancel={this.onClickCloseLoansHistory}
                  onClickViewOpenLoans={this.onClickViewOpenLoans}
                  onClickViewClosedLoans={this.onClickViewClosedLoans}
                  onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
                  onClickViewChargeFeeFine={this.onClickViewChargeFeeFine}
                  onClickViewOpenAccounts={this.onClickViewOpenAccounts}
                  onClickViewAccountActionsHistory={this.onClickViewAccountActionsHistory}
                  onClickViewClosedAccounts={this.onClickViewClosedAccounts}
                  onClickViewAllAccounts={this.onClickViewAllAccounts}
                  openLoans={query.layer === 'open-loans'}
                />
              </Layer>
            )}
          </FormattedMessage>
        </IfPermission>
      );
    }

    if (this.isLayerOpen('loan')) {
      return (
        <IfPermission perm="ui-users.loans.all">
          <FormattedMessage id="ui-users.loanActionsHistory">
            {contentLabel => (
              <Layer
                isOpen={this.isLayerOpen('loan')}
                contentLabel={contentLabel}
              >
                <this.connectedLoanActionsHistory
                  user={user}
                  loan={this.state.selectedLoan}
                  loans={loans}
                  loanid={query.loan}
                  patronBlocks={patronBlocks}
                  patronGroup={patronGroup}
                  stripes={stripes}
                  onCancel={this.onClickCloseLoanActionsHistory}
                  // when navigating away to another user, clear all loan-related state
                  onClickUser={() => { this.onClickCloseLoanActionsHistory(); this.onClickCloseLoansHistory(); }}
                  onClickViewOpenAccounts={this.onClickViewOpenAccounts}
                  onClickViewAccountActionsHistory={this.onClickViewAccountActionsHistory}
                  onClickViewClosedAccounts={this.onClickViewClosedAccounts}
                  onClickViewAllAccounts={this.onClickViewAllAccounts}
                />
              </Layer>
            )}
          </FormattedMessage>
        </IfPermission>
      );
    }

    if (this.isLayerOpen('edit')) {
      return (
        <FormattedMessage id="ui-users.editUserDialog">
          {contentLabel => (
            <Layer
              isOpen={this.isLayerOpen('edit')}
              contentLabel={contentLabel}
              afterClose={this.afterCloseEdit}
            >
              <UserForm
                stripes={stripes}
                initialValues={userFormData}
                onSubmit={record => this.update(record)}
                onCancel={onCloseEdit}
                parentResources={{
                  ...resources,
                  ...parentResources,
                }}
                parentMutator={parentMutator}
              />
            </Layer>
          )}
        </FormattedMessage>
      );
    }

    return null;
  }

  renderDetailMenu(user) {
    const {
      tagsEnabled,
      tagsToggle,
      onEdit,
      editLink
    } = this.props;

    const tags = ((user && user.tags) || {}).tagList || [];

    return (
      <PaneMenu>
        {
          tagsEnabled &&
          <FormattedMessage id="ui-users.showTags">
            {ariaLabel => (
              <PaneHeaderIconButton
                icon="tag"
                id="clickable-show-tags"
                onClick={tagsToggle}
                badgeCount={tags.length}
                ariaLabel={ariaLabel}
              />
            )}
          </FormattedMessage>
        }
        <IfPermission perm="users.item.put">
          <FormattedMessage id="ui-users.crud.editUser">
            {ariaLabel => (
              <PaneHeaderIconButton
                icon="edit"
                id="clickable-edituser"
                style={{ visibility: !user ? 'hidden' : 'visible' }}
                onClick={onEdit}
                href={editLink}
                ref={this.editButton}
                ariaLabel={ariaLabel}
              />
            )}
          </FormattedMessage>
        </IfPermission>
      </PaneMenu>
    );
  }

  renderSpinner() {
    const { paneWidth, onClose } = this.props;
    const detailMenu = this.renderDetailMenu();

    return (
      <Pane
        id="pane-userdetails"
        defaultWidth={paneWidth}
        paneTitle={<FormattedMessage id="ui-users.information.userDetails" />}
        lastMenu={detailMenu}
        dismissible
        onClose={onClose}
      >
        <div style={{ paddingTop: '1rem' }}>
          <Icon icon="spinner-ellipsis" width="100px" />
        </div>
      </Pane>
    );
  }

  // eslint-disable-next-line consistent-return
  getActionMenu = ({ onToggle }) => {
    const {
      onEdit,
      stripes,
    } = this.props;
    const handleClick = () => {
      onEdit();
      onToggle();
    };

    if (stripes.hasPerm('ui-users.edit')) {
      return (
        <Button
          data-test-user-instance-edit-action
          buttonStyle="dropdownItem"
          onClick={handleClick}
        >
          <Icon icon="edit">
            <FormattedMessage id="ui-users.edit" />
          </Icon>
        </Button>
      );
    }
  };

  renderUser(user) {
    const {
      resources,
      stripes,
      parentResources,
      onClose,
      paneWidth,
      match,
    } = this.props;

    const addressTypes = (parentResources.addressTypes || {}).records || [];
    const addresses = toListAddresses(get(user, ['personal', 'addresses'], []), addressTypes);
    const permissions = (resources.permissions || {}).records || [];
    const settings = (resources.settings || {}).records || [];
    const sponsors = this.props.getSponsors();
    const proxies = this.props.getProxies();
    const servicePoints = this.props.getServicePoints();
    const preferredServicePoint = this.props.getPreferredServicePoint();
    const hasPatronBlocks = (get(resources, ['hasPatronBlocks', 'isPending'], true)) ? -1 : 1;
    const totalPatronBlocks = get(resources, ['hasPatronBlocks', 'other', 'totalRecords'], 0);
    const patronBlocks = get(resources, ['hasPatronBlocks', 'records'], []);
    const patronGroup = this.getPatronGroup(user);
    const detailMenu = this.renderDetailMenu(user);

    return (
      <Pane
        data-test-instance-details
        id="pane-userdetails"
        appIcon={<AppIcon app="users" appIconKey="users" />}
        defaultWidth={paneWidth}
        paneTitle={
          <span data-test-header-title>
            {getFullName(user)}
          </span>
        }
        lastMenu={detailMenu}
        dismissible
        onClose={onClose}
        actionMenu={this.getActionMenu}
      >
        <HasCommand
          commands={this.keyboardCommands}
          display={['new', 'edit', 'search']}
          isWithinScope={this.checkScope}
          scope={document.body}
        >
          <TitleManager record={getFullName(user)} />
          <Headline
            size="xx-large"
            tag="h2"
          >
            {getFullName(user)}
          </Headline>
          <Row>
            <Col xs={10}>
              {(hasPatronBlocks === 1 && totalPatronBlocks > 0)
                ? <PatronBlockMessage />
                : ''}
            </Col>
            <Col xs={2} id="view-users-accordion-section">
              <ExpandAllButton
                accordionStatus={this.state.sections}
                onToggle={this.handleExpandAll}
              />
            </Col>
          </Row>
          <AccordionSet>
            <this.connectedUserInfo
              accordionId="userInformationSection"
              user={user}
              patronGroup={patronGroup}
              settings={settings}
              stripes={stripes}
              expanded={this.state.sections.userInformationSection}
              onToggle={this.handleSectionToggle}
            />
            <IfPermission perm="manualblocks.collection.get">
              <this.connectedPatronBlock
                accordionId="patronBlocksSection"
                user={user}
                hasPatronBlocks={(hasPatronBlocks === 1 && totalPatronBlocks > 0)}
                patronBlocks={patronBlocks}
                expanded={this.state.sections.patronBlocksSection}
                onToggle={this.handleSectionToggle}
                onClickViewPatronBlock={this.onClickViewPatronBlock}
                addRecord={this.state.addRecord}
                {...this.props}
              />
            </IfPermission>
            <ExtendedInfo
              accordionId="extendedInfoSection"
              user={user}
              expanded={this.state.sections.extendedInfoSection}
              onToggle={this.handleSectionToggle}
            />
            <ContactInfo
              accordionId="contactInfoSection"
              stripes={stripes}
              user={user}
              addresses={addresses}
              addressTypes={addressTypes}
              expanded={this.state.sections.contactInfoSection}
              onToggle={this.handleSectionToggle}
            />
            <IfPermission perm="proxiesfor.collection.get">
              <ProxyPermissions
                user={user}
                accordionId="proxySection"
                onToggle={this.handleSectionToggle}
                proxies={proxies}
                sponsors={sponsors}
                expanded={this.state.sections.proxySection}
                {...this.props}
              />
            </IfPermission>

            <IfPermission perm="accounts.collection.get">
              <this.connectedUserAccounts
                onClickViewChargeFeeFine={this.onClickViewChargeFeeFine}
                expanded={this.state.sections.accountsSection}
                onToggle={this.handleSectionToggle}
                accordionId="accountsSection"
                addRecord={this.state.addRecord}
                {...this.props}
              />
            </IfPermission>

            <IfPermission perm="ui-users.loans.all">
              <IfInterface name="loan-policy-storage">
                { /* Check without version, so can support either of multiple versions.
          Replace with specific check when facility for providing
          multiple versions is available */ }
                <IfInterface name="circulation">
                  <this.connectedUserLoans
                    onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
                    onClickViewOpenLoans={this.onClickViewOpenLoans}
                    onClickViewClosedLoans={this.onClickViewClosedLoans}
                    expanded={this.state.sections.loansSection}
                    onToggle={this.handleSectionToggle}
                    accordionId="loansSection"
                    {...this.props}
                  />
                </IfInterface>
              </IfInterface>
            </IfPermission>

            <IfPermission perm="ui-users.requests.all">
              <IfInterface name="request-storage" version="2.5 3.0">
                <this.connectedUserRequests
                  expanded={this.state.sections.requestsSection}
                  onToggle={this.handleSectionToggle}
                  accordionId="requestsSection"
                  user={user}
                  {...this.props}
                />
              </IfInterface>
            </IfPermission>

            <IfPermission perm="perms.users.get">
              <IfInterface name="permissions" version="5.0">
                <UserPermissions
                  expanded={this.state.sections.permissionsSection}
                  onToggle={this.handleSectionToggle}
                  userPermissions={permissions}
                  accordionId="permissionsSection"
                  {...this.props}
                />
              </IfInterface>
            </IfPermission>

            <IfPermission perm="inventory-storage.service-points.collection.get,inventory-storage.service-points-users.collection.get">
              <IfInterface name="service-points-users" version="1.0">
                <UserServicePoints
                  expanded={this.state.sections.servicePointsSection}
                  onToggle={this.handleSectionToggle}
                  accordionId="servicePointsSection"
                  servicePoints={servicePoints}
                  preferredServicePoint={preferredServicePoint}
                  {...this.props}
                />
              </IfInterface>
            </IfPermission>
            <NotesSmartAccordion
              domainName="users"
              entityId={match.params.id}
              entityName={getFullName(user)}
              open={this.state.sections.notesAccordion}
              onToggle={this.handleSectionToggle}
              id="notesAccordion"
              entityType="user"
              pathToNoteCreate="/users/notes/new"
              pathToNoteDetails="/users/notes"
              hideAssignButton
            />
          </AccordionSet>
        </HasCommand>
      </Pane>
    );
  }

  render() {
    const user = this.getUser();

    if (!user) {
      return this.renderSpinner();
    }

    return this.renderLayer(user) || this.renderUser(user);
  }
}

export default compose(
  withServicePoints,
  withTags,
  withProxy,
)(ViewUser);
