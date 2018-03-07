import { cloneDeep, get, omit, differenceBy } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Icon from '@folio/stripes-components/lib/Icon';
import Layer from '@folio/stripes-components/lib/Layer';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import IfInterface from '@folio/stripes-components/lib/IfInterface';
import { ExpandAllButton } from '@folio/stripes-components/lib/Accordion';
import IconButton from '@folio/stripes-components/lib/IconButton';
import removeQueryParam from '@folio/stripes-components/util/removeQueryParam';

import UserForm from './UserForm';
import LoansHistory from './LoansHistory';
import LoanActionsHistory from './LoanActionsHistory';

import { toListAddresses, toUserAddresses } from './converters/address';
import { getFullName, eachPromise } from './util';
import withProxy from './withProxy';

import {
  UserInfo,
  ExtendedInfo,
  ContactInfo,
  ProxyPermissions,
  UserPermissions,
  UserLoans,
} from './lib/ViewSections';

class ViewUser extends React.Component {
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
    location: PropTypes.object,
    history: PropTypes.object,
    parentResources: PropTypes.shape({
      addressTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    parentMutator: PropTypes.shape({}),
    updateProxies: PropTypes.func,
    updateSponsors: PropTypes.func,
    getSponsors: PropTypes.func,
    getProxies: PropTypes.func,
  };

  static manifest = Object.freeze({
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

  constructor(props) {
    super(props);
    this.state = {
      viewOpenLoansMode: false,
      selectedLoan: {},
      lastUpdate: null,
      sections: {
        userInformationSection: true,
        extendedInfoSection: false,
        contactInfoSection: false,
        proxySection: false,
        loansSection: false,
        permissionsSection: false,
      },
    };

    this.connectedUserLoans = props.stripes.connect(UserLoans);
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
    this.transitionToParams = transitionToParams.bind(this);
    this.removeQueryParam = removeQueryParam.bind(this);
    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.handleExpandAll = this.handleExpandAll.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.addressTypes = (nextProps.parentResources.addressTypes || {}).records || [];
  }

  onClickViewOpenLoans(e) {
    if (e) e.preventDefault();
    this.transitionToParams({ layer: 'open-loans' });

    this.setState({
      viewOpenLoansMode: true,
    });
  }

  onClickViewClosedLoans(e) {
    if (e) e.preventDefault();
    this.transitionToParams({ layer: 'closed-loans' });
    this.setState({
      viewOpenLoansMode: false,
    });
  }

  onClickCloseLoansHistory(e) {
    if (e) e.preventDefault();
    this.removeQueryParam('layer');
  }

  onClickViewLoanActionsHistory(e, selectedLoan) {
    if (e) e.preventDefault();
    this.transitionToParams({ layer: 'loan', loan: selectedLoan.id });

    this.setState({
      selectedLoan,
    });
  }

  onClickCloseLoanActionsHistory(e) {
    if (e) e.preventDefault();
    const layer = this.state.viewOpenLoansMode ? 'open-loans' : 'closed-loans';
    this.transitionToParams({ layer, loan: null });
    this.setState({
      selectedLoan: {},
    });
  }

  onAddressesUpdate(addresses) {
    const user = this.getUser();
    if (!user) return;
    user.personal.addresses = addresses;
    this.update(user);
  }

  getUser() {
    const { resources, match: { params: { id } } } = this.props;
    const selUser = (resources.selUser || {}).records || [];
    if (!selUser || selUser.length === 0 || !id) return null;
    // Logging below shows this DOES sometimes find the wrong record. But why?
    // console.log(`getUser: found ${selUser.length} users, id '${selUser[0].id}' ${selUser[0].id === id ? '==' : '!='} '${id}'`);
    return selUser.find(u => u.id === id);
  }

  // eslint-disable-next-line class-methods-use-this
  getUserFormData(user, addresses, sponsors, proxies, permissions) {
    const userForData = user ? cloneDeep(user) : user;
    userForData.personal.addresses = addresses;
    Object.assign(userForData, { sponsors, proxies, permissions });

    return userForData;
  }

  update(user) {
    if (user.personal.addresses) {
      user.personal.addresses = toUserAddresses(user.personal.addresses, this.addressTypes); // eslint-disable-line no-param-reassign
    }

    const { proxies, sponsors, permissions } = user;

    if (proxies) this.props.updateProxies(proxies);
    if (sponsors) this.props.updateSponsors(sponsors);
    if (permissions) this.updatePermissions(permissions);

    const data = omit(user, ['creds', 'proxies', 'sponsors', 'permissions']);

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

  handleSectionToggle({ id }) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];
      return newState;
    });
  }

  handleExpandAll(obj) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.sections = obj;
      return newState;
    });
  }

  render() {
    const { resources, location, stripes } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    const user = this.getUser();
    const patronGroups = (resources.patronGroups || {}).records || [];
    const permissions = (resources.permissions || {}).records || [];
    const settings = (resources.settings || {}).records || [];
    const sponsors = this.props.getSponsors();
    const proxies = this.props.getProxies();

    const detailMenu =
    (
      <PaneMenu>
        <IconButton
          icon="comment"
          id="clickable-show-notes"
          style={{ visibility: !user ? 'hidden' : 'visible' }}
          onClick={this.props.notesToggle}
          title="Show Notes"
        />
        <IfPermission perm="users.item.put">
          <IconButton
            icon="edit"
            id="clickable-edituser"
            style={{ visibility: !user ? 'hidden' : 'visible' }}
            onClick={this.props.onEdit}
            href={this.props.editLink}
            title="Edit User"
          />
        </IfPermission>
      </PaneMenu>
    );

    if (!user) {
      return (
        <Pane id="pane-userdetails" defaultWidth={this.props.paneWidth} paneTitle="User Details" lastMenu={detailMenu} dismissible onClose={this.props.onClose}>
          <div style={{ paddingTop: '1rem' }}><Icon icon="spinner-ellipsis" width="100px" /></div>
        </Pane>
      );
    }

    const patronGroupId = get(user, ['patronGroup'], '');
    const patronGroup = patronGroups.find(g => g.id === patronGroupId) || { group: '' };
    const addresses = toListAddresses(get(user, ['personal', 'addresses'], []), this.addressTypes);
    const userFormData = this.getUserFormData(user, addresses, sponsors, proxies, permissions);

    return (
      <Pane id="pane-userdetails" defaultWidth={this.props.paneWidth} paneTitle={getFullName(user)} lastMenu={detailMenu} dismissible onClose={this.props.onClose} appIcon="users">
        <Row end="xs"><Col xs><ExpandAllButton accordionStatus={this.state.sections} onToggle={this.handleExpandAll} /></Col></Row>

        <this.connectedUserInfo user={user} patronGroup={patronGroup} settings={settings} stripes={stripes} />
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

        <IfPermission perm="circulation.loans.collection.get">
          <IfInterface name="circulation" version="2.1">
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

        <Layer isOpen={query.layer ? query.layer === 'edit' : false} label="Edit User Dialog">
          <UserForm
            stripes={stripes}
            initialValues={userFormData}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.props.onCloseEdit}
            parentResources={this.props.parentResources}
            parentMutator={this.props.parentMutator}
          />
        </Layer>
        <Layer isOpen={query.layer ? query.layer === 'open-loans' || query.layer === 'closed-loans' : false} label="Loans">
          <this.connectedLoansHistory
            user={user}
            patronGroup={patronGroup}
            stripes={stripes}
            history={this.props.history}
            onCancel={this.onClickCloseLoansHistory}
            onClickViewOpenLoans={this.onClickViewOpenLoans}
            onClickViewClosedLoans={this.onClickViewClosedLoans}
            onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
            openLoans={query.layer === 'open-loans'}
          />
        </Layer>
        <Layer isOpen={query.layer ? query.layer === 'loan' : false} label="Loan Actions History">
          <this.connectedLoanActionsHistory
            user={user}
            loan={this.state.selectedLoan}
            loanid={this.state.selectedLoan.id}
            stripes={stripes}
            onCancel={this.onClickCloseLoanActionsHistory}
            // when navigating away to another user, clear all loan-related state
            onClickUser={() => { this.onClickCloseLoanActionsHistory(); this.onClickCloseLoansHistory(); }}
          />
        </Layer>
      </Pane>
    );
  }
}

export default withProxy(ViewUser);
