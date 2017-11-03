import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Icon from '@folio/stripes-components/lib/Icon';
import Layer from '@folio/stripes-components/lib/Layer';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import IfInterface from '@folio/stripes-components/lib/IfInterface';
import { Accordion, ExpandAllButton } from '@folio/stripes-components/lib/Accordion';

import UserForm from './UserForm';
import UserPermissions from './UserPermissions';
import ProxyPermissions from './ProxyPermissions';
import UserLoans from './UserLoans';
import LoansHistory from './LoansHistory';
import LoanActionsHistory from './LoanActionsHistory';
import contactTypes from './data/contactTypes';
import UserAddresses from './lib/UserAddresses';
import { toListAddresses, toUserAddresses } from './converters/address';
import removeQueryParam from './removeQueryParam';
import { getFullName } from './util';

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
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      selUser: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
    }),
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    onClose: PropTypes.func,
    okapi: PropTypes.object,
    addressTypes: PropTypes.arrayOf(PropTypes.object),
    notesToggle: PropTypes.func,
    location: PropTypes.object,
    history: PropTypes.object,
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
  });

  constructor(props) {
    super(props);
    this.state = {
      viewLoansHistoryMode: false,
      viewOpenLoansMode: false,
      viewLoanActionsHistoryMode: false,
      selectedLoan: {},
      lastUpdate: null,
      sections: {
        infoSection: true,
        addressSection: true,
        loansSection: true,
        proxySection: true,
        permissionsSection: true,
      },
    };
    this.onClickEditUser = this.onClickEditUser.bind(this);
    this.onClickCloseEditUser = this.onClickCloseEditUser.bind(this);
    this.connectedUserLoans = props.stripes.connect(UserLoans);
    this.connectedLoansHistory = props.stripes.connect(LoansHistory);
    this.connectedLoanActionsHistory = props.stripes.connect(LoanActionsHistory);
    this.connectedUserPermissions = props.stripes.connect(UserPermissions);
    this.connectedProxyPermissions = props.stripes.connect(ProxyPermissions);

    this.dateLastUpdated = this.dateLastUpdated.bind(this);
    this.onClickCloseLoansHistory = this.onClickCloseLoansHistory.bind(this);
    this.onClickViewOpenLoans = this.onClickViewOpenLoans.bind(this);
    this.onClickViewClosedLoans = this.onClickViewClosedLoans.bind(this);
    this.onClickViewLoanActionsHistory = this.onClickViewLoanActionsHistory.bind(this);
    this.onClickCloseLoanActionsHistory = this.onClickCloseLoanActionsHistory.bind(this);
    this.onAddressesUpdate = this.onAddressesUpdate.bind(this);
    this.transitionToParams = transitionToParams.bind(this);

    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.handleExpandAll = this.handleExpandAll.bind(this);
  }

  // EditUser Handlers
  onClickEditUser(e) {
    if (e) e.preventDefault();
    this.props.stripes.logger.log('action', 'clicked "edit user"');
    this.transitionToParams({ layer: 'edit' });
  }

  onClickCloseEditUser(e) {
    if (e) e.preventDefault();
    this.props.stripes.logger.log('action', 'clicked "close edit user"');
    removeQueryParam('layer', this.props.location, this.props.history);
  }

  onClickViewOpenLoans(e) {
    if (e) e.preventDefault();
    this.setState({
      viewLoansHistoryMode: true,
      viewOpenLoansMode: true,
    });
  }

  onClickViewClosedLoans(e) {
    if (e) e.preventDefault();
    this.setState({
      viewLoansHistoryMode: true,
      viewOpenLoansMode: false,
    });
  }

  onClickCloseLoansHistory(e) {
    if (e) e.preventDefault();
    this.setState({
      viewLoansHistoryMode: false,
      viewOpenLoansMode: false,
    });
  }

  onClickViewLoanActionsHistory(e, selectedLoan) {
    if (e) e.preventDefault();
    this.setState({
      viewLoanActionsHistoryMode: true,
      selectedLoan,
    });
  }

  onClickCloseLoanActionsHistory(e) {
    if (e) e.preventDefault();
    this.setState({
      viewLoanActionsHistoryMode: false,
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
    return selUser.find(u => u.id === id);
  }

   // eslint-disable-next-line class-methods-use-this
  getUserFormData(user, addresses) {
    const userForData = user ? _.cloneDeep(user) : user;
    userForData.personal.addresses = addresses;
    return userForData;
  }

  update(user) {
    if (user.personal.addresses) {
      user.personal.addresses = toUserAddresses(user.personal.addresses, this.props.addressTypes); // eslint-disable-line no-param-reassign
    }

    // eslint-disable-next-line no-param-reassign
    if (user.creds) delete user.creds; // not handled on edit (yet at least)
    this.props.mutator.selUser.PUT(user).then(() => {
      this.setState({
        lastUpdate: new Date().toISOString(),
      });
      this.onClickCloseEditUser();
    });
  }

  // This is a helper function for the "last updated" date element. Since the
  // date/time is actually set on the server when the record is updated, the
  // lastUpdated element of the record on the client side might contain a stale
  // value. If so, this returns a locally stored update date until the data
  // is refreshed.
  dateLastUpdated(user) {
    const updatedDateRec = _.get(user, ['updatedDate'], '');
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
      const newState = _.cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];
      return newState;
    });
  }

  handleExpandAll(obj) {
    this.setState((curState) => {
      const newState = _.cloneDeep(curState);
      newState.sections = obj;
      return newState;
    });
  }

  render() {
    const { resources, location } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    const user = this.getUser();
    const patronGroups = (resources.patronGroups || {}).records || [];

    const detailMenu = (<PaneMenu>
      <button id="clickable-show-notes" style={{ visibility: !user ? 'hidden' : 'visible' }} onClick={this.props.notesToggle} title="Show Notes"><Icon icon="comment" />Notes</button>
      <IfPermission perm="users.item.put">
        <button id="clickable-edituser" style={{ visibility: !user ? 'hidden' : 'visible' }} onClick={this.onClickEditUser} title="Edit User"><Icon icon="edit" />Edit</button>
      </IfPermission>
    </PaneMenu>);

    if (!user) return (
      <Pane id="pane-userdetails" defaultWidth={this.props.paneWidth} paneTitle="User Details" lastMenu={detailMenu} dismissible onClose={this.props.onClose}>
        <div style={{ paddingTop: '1rem' }}><Icon icon="spinner-ellipsis" width="100px" /></div>
      </Pane>
    );

    const userStatus = (_.get(user, ['active'], '') ? 'active' : 'inactive');
    const patronGroupId = _.get(user, ['patronGroup'], '');
    const patronGroup = patronGroups.find(g => g.id === patronGroupId) || { group: '' };
    const preferredContact = contactTypes.find(g => g.id === _.get(user, ['personal', 'preferredContactTypeId'], '')) || { type: '' };
    const addresses = toListAddresses(_.get(user, ['personal', 'addresses'], []), this.props.addressTypes);
    const userFormData = this.getUserFormData(user, addresses);

    return (
      <Pane id="pane-userdetails" defaultWidth={this.props.paneWidth} paneTitle="User Details" lastMenu={detailMenu} dismissible onClose={this.props.onClose}>
        <Row end="xs"><Col xs><ExpandAllButton accordionStatus={this.state.sections} onToggle={this.handleExpandAll} /></Col></Row>
        <Accordion
          open={this.state.sections.infoSection}
          id="infoSection"
          onToggle={this.handleSectionToggle}
          label={<h2>{getFullName(user)}</h2>}
        >
          <Row>
            <Col xs={7} >
              <Row>
                <Col xs={12}>
                  <KeyValue label="Username" value={_.get(user, ['username'], '')} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Status" value={userStatus} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Email" value={_.get(user, ['personal', 'email'], '')} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Phone" value={_.get(user, ['personal', 'phone'], '')} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Mobile phone" value={_.get(user, ['personal', 'mobilePhone'], '')} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Preferred contact" value={preferredContact.desc} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Date of birth" value={(_.get(user, ['personal', 'dateOfBirth'], '')) ? new Date(Date.parse(_.get(user, ['personal', 'dateOfBirth'], ''))).toLocaleDateString(this.props.stripes.locale) : ''} />
                </Col>
              </Row>
            </Col>
            <Col xs={5} >
              <Row>
                <Col xs={12}>
                  <img className="floatEnd" src="http://placehold.it/175x175" role="presentation" />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Date enrolled" value={(_.get(user, ['enrollmentDate'], '')) ? new Date(Date.parse(_.get(user, ['enrollmentDate'], ''))).toLocaleDateString(this.props.stripes.locale) : ''} />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <KeyValue label="Expiration date" value={(_.get(user, ['expirationDate'], '')) ? new Date(Date.parse(_.get(user, ['expirationDate'], ''))).toLocaleDateString(this.props.stripes.locale) : ''} />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <KeyValue label="Open date" value={(_.get(user, ['createdDate'], '')) ? new Date(Date.parse(_.get(user, ['createdDate'], ''))).toLocaleString(this.props.stripes.locale) : ''} />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <KeyValue label="Record last updated" value={this.dateLastUpdated(user)} />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <KeyValue label="Bar code" value={_.get(user, ['barcode'], '')} />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <KeyValue label="FOLIO record number" value={_.get(user, ['id'], '')} />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <KeyValue label="External System ID" value={_.get(user, ['externalSystemId'], '')} />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <KeyValue label="Patron group" value={patronGroup.group} />
                </Col>
              </Row>
            </Col>
          </Row>
        </Accordion>
        <UserAddresses
          onUpdate={this.onAddressesUpdate}
          addressTypes={this.props.addressTypes}
          addresses={addresses}
          expanded={this.state.sections.addressSection}
          onToggle={this.handleSectionToggle}
          accordionId="addressSection"
        />
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
        <this.connectedProxyPermissions
          user={user}
          stripes={this.props.stripes}
          match={this.props.match}
          expanded={this.state.sections.proxySection}
          onToggle={this.handleSectionToggle}
          accordionId="proxySection"
          editable
          {...this.props}
        />
        <IfPermission perm="perms.users.get">
          <IfInterface name="permissions" version="5.0">
            <this.connectedUserPermissions
              stripes={this.props.stripes}
              match={this.props.match}
              expanded={this.state.sections.permissionsSection}
              onToggle={this.handleSectionToggle}
              accordionId="permissionsSection"
              editable
              {...this.props}
            />
          </IfInterface>
        </IfPermission>
        <Layer isOpen={query.layer ? query.layer === 'edit' : false} label="Edit User Dialog">
          <UserForm
            initialValues={userFormData}
            addressTypes={this.props.addressTypes}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.onClickCloseEditUser}
            okapi={this.props.okapi}
            optionLists={{ patronGroups, contactTypes }}
          />
        </Layer>
        <Layer isOpen={this.state.viewLoansHistoryMode} label="Loans">
          <this.connectedLoansHistory
            user={user}
            patronGroup={patronGroup}
            stripes={this.props.stripes}
            history={this.props.history}
            onCancel={this.onClickCloseLoansHistory}
            onClickViewOpenLoans={this.onClickViewOpenLoans}
            onClickViewClosedLoans={this.onClickViewClosedLoans}
            onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
            openLoans={this.state.viewOpenLoansMode}
          />
        </Layer>
        <Layer isOpen={this.state.viewLoanActionsHistoryMode} label="Loans Actions History">
          <this.connectedLoanActionsHistory
            user={user}
            loan={this.state.selectedLoan}
            loanid={this.state.selectedLoan.id}
            stripes={this.props.stripes}
            onCancel={this.onClickCloseLoanActionsHistory}
            // when navigating away to another user, clear all loan-related state
            onClickUser={() => { this.onClickCloseLoanActionsHistory(); this.onClickCloseLoansHistory(); }}
          />
        </Layer>
      </Pane>

    );
  }
}

export default ViewUser;
