import { cloneDeep, get, omit, differenceBy, find } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import TitleManager from '@folio/stripes-core/src/components/TitleManager'; // eslint-disable-line import/no-unresolved
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Icon from '@folio/stripes-components/lib/Icon';
import Layer from '@folio/stripes-components/lib/Layer';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import IfInterface from '@folio/stripes-components/lib/IfInterface';
import { ExpandAllButton } from '@folio/stripes-components/lib/Accordion';
import IconButton from '@folio/stripes-components/lib/IconButton';
import { withTags } from '@folio/stripes-smart-components/lib/Tags';

import UserForm from './UserForm';
import LoansHistory from './LoansHistory';
import LoanActionsHistory from './LoanActionsHistory';

import { ChargeFeeFine } from './lib/Accounts';
import AccountsHistory from './AccountsHistory';
import AccountActionsHistory from './AccountActionsHistory';

import { toListAddresses, toUserAddresses } from './converters/address';
import { getFullName, eachPromise } from './util';
import withProxy from './withProxy';
import withServicePoints from './withServicePoints';

import {
  UserInfo,
  ExtendedInfo,
  ContactInfo,
  ProxyPermissions,
  UserPermissions,
  UserLoans,
  UserAccounts,
  UserServicePoints,
} from './lib/ViewSections';

class ViewUser extends React.Component {
  static manifest = Object.freeze({
    query: {},
    selUser: {
      type: 'okapi',
      path: 'users/:{id}',
      clear: false,
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
    },
    // NOTE: 'indexField', used as a parameter in the userPermissions paths,
    // modifies the API call so that the :{userid} parameter is actually
    // interpreted as a user ID. By default, that path component is taken as
    // the ID of the user/permission _object_ in /perms/users.
    permissions: {
      type: 'okapi',
      records: 'permissionNames',
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
      intl: PropTypes.object.isRequired,
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
    notesToggle: PropTypes.func,
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
  };

  constructor(props) {
    super(props);
    this.state = {
      viewOpenLoansMode: false,
      selectedLoan: {},
      selectedAccount: {},
      lastUpdate: null,
      sections: {
        userInformationSection: true,
        extendedInfoSection: false,
        contactInfoSection: false,
        proxySection: false,
        loansSection: false,
        accountsSection: false,
        permissionsSection: false,
        servicePointsSection: false,
      },
    };

    this.connectedUserLoans = props.stripes.connect(UserLoans);
    this.connectedUserAccounts = props.stripes.connect(UserAccounts);
    this.connectedLoansHistory = props.stripes.connect(LoansHistory);
    this.connectedLoanActionsHistory = props.stripes.connect(LoanActionsHistory);
    this.connectedUserInfo = props.stripes.connect(UserInfo);
    this.dateLastUpdated = this.dateLastUpdated.bind(this);
    this.onClickCloseLoansHistory = this.onClickCloseLoansHistory.bind(this);
    this.onClickViewOpenLoans = this.onClickViewOpenLoans.bind(this);
    this.onClickViewClosedLoans = this.onClickViewClosedLoans.bind(this);
    this.onClickViewLoanActionsHistory = this.onClickViewLoanActionsHistory.bind(this);
    this.onClickCloseLoanActionsHistory = this.onClickCloseLoanActionsHistory.bind(this);
    this.onAddressesUpdate = this.onAddressesUpdate.bind(this);
    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.handleExpandAll = this.handleExpandAll.bind(this);

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

  onClickViewOpenAccounts(e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: 'open-accounts' });
  }

  onClickViewClosedAccounts(e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: 'closed-accounts' });
  }

  onClickViewAllAccounts(e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: 'all-accounts' });
  }

  onClickCloseAccountsHistory(e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({ layer: null, f: null, q: null });
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
    const query = this.props.location.search ? queryString.parse(this.props.location.search) : {};
    this.setState({
      prevLayer: query.layer,
    });
    this.props.mutator.query.update({ layer: 'charge' });
    this.setState({
      selectedLoan,
    });
  }

  onCloseChargeFeeFine(e) {
    if (e) e.preventDefault();
    const layer = this.state.prevLayer;
    this.props.mutator.query.update({ layer });
    this.setState({
      selectedLoan: {},
    });
  }

  handleAddRecords() {
    const addRecord = !this.state.addRecord;
    this.setState({
      addRecord,
    });
  }

  getUser() {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];
    if (!selUser || selUser.length === 0 || !id) return null;
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

  update(user) {
    const addressTypes = (this.props.parentResources.addressTypes || {}).records || [];

    if (user.personal.addresses) {
      user.personal.addresses = toUserAddresses(user.personal.addresses, addressTypes); // eslint-disable-line no-param-reassign
    }

    const { proxies, sponsors, permissions, servicePoints, preferredServicePoint } = user;

    if (proxies) this.props.updateProxies(proxies);
    if (sponsors) this.props.updateSponsors(sponsors);
    if (permissions) this.updatePermissions(permissions);
    if (servicePoints) this.props.updateServicePoints(servicePoints, preferredServicePoint);

    const data = omit(user, ['creds', 'proxies', 'sponsors', 'permissions', 'servicePoints', 'preferredServicePoint']);

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

  render() {
    const { resources, stripes, parentResources, tagsEnabled } = this.props;

    const addressTypes = (parentResources.addressTypes || {}).records || [];
    const query = resources.query;
    const user = this.getUser();
    const patronGroups = (resources.patronGroups || {}).records || [];
    const permissions = (resources.permissions || {}).records || [];
    const settings = (resources.settings || {}).records || [];
    const sponsors = this.props.getSponsors();
    const proxies = this.props.getProxies();
    const servicePoints = this.props.getServicePoints();
    const preferredServicePoint = this.props.getPreferredServicePoint();
    const formatMsg = stripes.intl.formatMessage;
    const detailMenu =
    (
      <PaneMenu>
        {
          tagsEnabled && <IconButton
            icon="default"
            title={formatMsg({ id: 'ui-users.showTags' })}
            id="clickable-show-tags"
            style={{ visibility: !user ? 'hidden' : 'visible' }}
            onClick={this.props.tagsToggle}
            aria-label={formatMsg({ id: 'ui-users.showTags' })}
          />
        }
        <IconButton
          icon="comment"
          id="clickable-show-notes"
          style={{ visibility: !user ? 'hidden' : 'visible' }}
          onClick={this.props.notesToggle}
          aria-label={formatMsg({ id: 'ui-users.showNotes' })}
        />
        <IfPermission perm="users.item.put">
          <IconButton
            icon="edit"
            id="clickable-edituser"
            style={{ visibility: !user ? 'hidden' : 'visible' }}
            onClick={this.props.onEdit}
            href={this.props.editLink}
            aria-label={formatMsg({ id: 'ui-users.crud.editUser' })}
          />
        </IfPermission>
      </PaneMenu>
    );

    if (!user) {
      return (
        <Pane id="pane-userdetails" defaultWidth={this.props.paneWidth} paneTitle={formatMsg({ id: 'ui-users.information.userDetails' })} lastMenu={detailMenu} dismissible onClose={this.props.onClose}>
          <div style={{ paddingTop: '1rem' }}><Icon icon="spinner-ellipsis" width="100px" /></div>
        </Pane>
      );
    }

    const patronGroupId = get(user, ['patronGroup'], '');
    const patronGroup = patronGroups.find(g => g.id === patronGroupId) || { group: '' };
    const addresses = toListAddresses(get(user, ['personal', 'addresses'], []), addressTypes);
    const userFormData = this.getUserFormData(user, addresses, sponsors, proxies, permissions, servicePoints, preferredServicePoint);

    const loansHistory = (<this.connectedLoansHistory
      user={user}
      patronGroup={patronGroup}
      stripes={stripes}
      history={this.props.history}
      onCancel={this.onClickCloseLoansHistory}
      onClickViewOpenLoans={this.onClickViewOpenLoans}
      onClickViewClosedLoans={this.onClickViewClosedLoans}
      onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
      onClickViewChargeFeeFine={this.onClickViewChargeFeeFine}
      onClickViewOpenAccounts={this.onClickViewOpenAccounts}
      onClickViewClosedAccounts={this.onClickViewClosedAccounts}
      onClickViewAllAccounts={this.onClickViewAllAccounts}
      openLoans={query.layer === 'open-loans'}
    />);

    const loanDetails = (
      <this.connectedLoanActionsHistory
        user={user}
        loan={this.state.selectedLoan}
        loanid={query.loan}
        patronGroup={patronGroup}
        stripes={stripes}
        onCancel={this.onClickCloseLoanActionsHistory}
        // when navigating away to another user, clear all loan-related state
        onClickUser={() => { this.onClickCloseLoanActionsHistory(); this.onClickCloseLoansHistory(); }}
      />);

    return (
      <Pane id="pane-userdetails" defaultWidth={this.props.paneWidth} paneTitle={getFullName(user)} lastMenu={detailMenu} dismissible onClose={this.props.onClose} appIcon={{ app: 'users' }}>
        <TitleManager record={getFullName(user)} />
        <Row end="xs"><Col xs><ExpandAllButton accordionStatus={this.state.sections} onToggle={this.handleExpandAll} /></Col></Row>

        <this.connectedUserInfo accordionId="userInformationSection" user={user} patronGroup={patronGroup} settings={settings} stripes={stripes} expanded={this.state.sections.userInformationSection} onToggle={this.handleSectionToggle} />
        <ExtendedInfo accordionId="extendedInfoSection" stripes={stripes} user={user} expanded={this.state.sections.extendedInfoSection} onToggle={this.handleSectionToggle} />
        <ContactInfo accordionId="contactInfoSection" stripes={stripes} user={user} addresses={addresses} addressTypes={this.addressTypes} expanded={this.state.sections.contactInfoSection} onToggle={this.handleSectionToggle} />
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

        <IfPermission perm="circulation.loans.collection.get">
          <IfInterface name="circulation" version="3.0">
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
        </IfPermission>

        <IfPermission perm="perms.users.get">
          <IfInterface name="permissions" version="5.0">
            <UserPermissions
              stripes={stripes}
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
              stripes={stripes}
              expanded={this.state.sections.servicePointsSection}
              onToggle={this.handleSectionToggle}
              accordionId="servicePointsSection"
              servicePoints={servicePoints}
              preferredServicePoint={preferredServicePoint}
              {...this.props}
            />
          </IfInterface>
        </IfPermission>

        <Layer isOpen={query.layer ? query.layer === 'edit' : false} contentLabel={formatMsg({ id: 'ui-users.editUserDialog' })}>
          <UserForm
            stripes={stripes}
            initialValues={userFormData}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.props.onCloseEdit}
            parentResources={{
              ...this.props.resources,
              ...this.props.parentResources,
            }}
            parentMutator={this.props.parentMutator}
          />
        </Layer>

        <Layer isOpen={query.layer ? query.layer === 'open-accounts' || query.layer === 'closed-accounts' || query.layer === 'all-accounts' : false} label="Fees/Fines">
          <this.connectedAccountsHistory
            user={user}
            parentMutator={this.props.mutator}
            patronGroup={patronGroup}
            stripes={stripes}
            history={this.props.history}
            addRecord={this.state.addRecord}
            location={this.props.location}
            onCancel={this.onClickCloseAccountsHistory}
            onClickViewChargeFeeFine={this.onClickViewChargeFeeFine}
            onClickViewAccountActionsHistory={this.onClickViewAccountActionsHistory}
            onClickCloseAccountActionsHistory={this.onClickCloseAccountActionsHistory}
          />
        </Layer>
        <Layer isOpen={query.layer ? query.layer === 'charge' : false} label="Charge Fee/Fine">
          <this.connectedCharge
            stripes={stripes}
            onCloseChargeFeeFine={this.onCloseChargeFeeFine}
            user={user}
            loan={{ item: {} }}
            selectedLoan={this.state.selectedLoan}
            handleAddRecords={this.handleAddRecords}
          />
        </Layer>
        <Layer isOpen={query.layer ? query.layer === 'account' : false} label="Account Actions History">
          <this.connectedAccountActionsHistory
            user={user}
            account={this.state.selectedAccount}
            accountid={this.state.selectedAccount.id}
            history={this.props.history}
            stripes={stripes}
            onCancel={this.onClickCloseAccountActionsHistory}
            // when navigating away to another user, clear all loan-related state
            onClickUser={() => { this.onClickCloseAccountActionsHistory(); this.onClickCloseAccountsHistory(); }}
          />
        </Layer>

        <IfPermission perm="circulation.loans.collection.get">
          <Layer isOpen={query.layer ? query.layer === 'open-loans' || query.layer === 'closed-loans' : false} contentLabel={formatMsg({ id: 'ui-users.loans.title' })}>
            {loansHistory}
          </Layer>
        </IfPermission>
        <Layer isOpen={query.layer ? query.layer === 'loan' : false} contentLabel={formatMsg({ id: 'ui-users.loanActionsHistory' })}>
          {loanDetails}
        </Layer>
      </Pane>
    );
  }
}

export default withServicePoints(withTags(withProxy(ViewUser)));
