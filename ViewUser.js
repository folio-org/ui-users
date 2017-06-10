import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { Component, PropTypes } from 'react';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from 'react-bootstrap';
import TextField from '@folio/stripes-components/lib/TextField';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Icon from '@folio/stripes-components/lib/Icon';
import Layer from '@folio/stripes-components/lib/Layer';
import IfPermission from '@folio/stripes-components/lib/IfPermission';
import IfInterface from '@folio/stripes-components/lib/IfInterface';

import UserForm from './UserForm';
import UserPermissions from './UserPermissions';
import UserLoans from './UserLoans';
import LoansHistory from './LoansHistory';
import contactTypes from './data/contactTypes';

class ViewUser extends Component {

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
    data: PropTypes.shape({
      user: PropTypes.arrayOf(PropTypes.object),
      patronGroups: PropTypes.arrayOf(PropTypes.object),
      editMode: PropTypes.shape({
        mode: PropTypes.bool,
      }),
    }),
    mutator: React.PropTypes.shape({
      selUser: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired,
      }),
      editMode: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    onClose: PropTypes.func,
    okapi: PropTypes.object,
  };

  static manifest = Object.freeze({
    editMode: {},
    selUser: {
      type: 'okapi',
      path: 'users/:{userid}',
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
    };
    this.onClickEditUser = this.onClickEditUser.bind(this);
    this.onClickCloseEditUser = this.onClickCloseEditUser.bind(this);
    this.connectedUserLoans = props.stripes.connect(UserLoans);
    this.connectedLoansHistory = props.stripes.connect(LoansHistory);
    this.connectedUserPermissions = props.stripes.connect(UserPermissions);
    this.onClickViewLoansHistory = this.onClickViewLoansHistory.bind(this);
    this.onClickCloseLoansHistory = this.onClickCloseLoansHistory.bind(this);
  }

  componentWillMount() {
    if (_.isEmpty(this.props.data.editMode)) this.props.mutator.editMode.replace({ mode: false });
  }

  // EditUser Handlers
  onClickEditUser(e) {
    if (e) e.preventDefault();
    this.props.stripes.logger.log('action', 'clicked "edit user"');
    this.props.mutator.editMode.replace({ mode: true });
  }

  onClickCloseEditUser(e) {
    if (e) e.preventDefault();
    this.props.stripes.logger.log('action', 'clicked "close edit user"');
    this.props.mutator.editMode.replace({ mode: false });
  }

  onClickViewLoansHistory(e) {
    if (e) e.preventDefault();
    this.setState({
      viewLoansHistoryMode: true,
    });
  }

  onClickCloseLoansHistory(e) {
    if (e) e.preventDefault();
    this.setState({
      viewLoansHistoryMode: false,
    });
  }

  update(data) {
    // eslint-disable-next-line no-param-reassign
    if (data.creds) delete data.creds; // not handled on edit (yet at least)
    this.props.mutator.selUser.PUT(data).then(() => {
      this.onClickCloseEditUser();
    });
  }

  render() {
    const dueDate = new Date(Date.parse('2014-11-12')).toLocaleDateString(this.props.stripes.locale);
    const fineHistory = [{ 'Due Date': dueDate, Amount: '34.23', Status: 'Unpaid' }];

    const { data: { selUser, patronGroups }, match: { params: { userid } } } = this.props;

    const detailMenu = (<PaneMenu>
      <IfPermission perm="users.item.put">
        <button onClick={this.onClickEditUser} title="Edit User"><Icon icon="edit" />Edit</button>
      </IfPermission>
    </PaneMenu>);

    if (!selUser || selUser.length === 0 || !userid) return <div />;

    const user = selUser.find(u => u.id === userid);
    if (!user) return <div />;
    const userStatus = (_.get(user, ['active'], '') ? 'active' : 'inactive');
    const patronGroupId = _.get(user, ['patronGroup'], '');
    const patronGroup = patronGroups.find(g => g.id === patronGroupId) || { group: '' };
    const preferredContact = contactTypes.find(g => g.id === _.get(user, ['personal', 'preferredContactTypeId'], '')) || { type: '' };

    return (
      <Pane defaultWidth={this.props.paneWidth} paneTitle="User Details" lastMenu={detailMenu} dismissible onClose={this.props.onClose}>
        <Row>
          <Col xs={7} >
            <Row>
              <Col xs={12}>
                <h2>{_.get(user, ['personal', 'lastName'], '')}, {_.get(user, ['personal', 'firstName'], '')} {_.get(user, ['personal', 'middleName'], '')}</h2>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <KeyValue label="User ID" value={_.get(user, ['username'], '')} />
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
            <br />
            <Row>
              <Col xs={12}>
                <KeyValue label="Patron group" value={patronGroup.group} />
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
          </Col>
        </Row>
        <br />
        <hr />
        <br />
        <Row>
          <Col xs={3}>
            <h3 className="marginTopHalf">Fines</h3>
          </Col>
          <Col xs={4} sm={3}>
            <TextField
              rounded
              endControl={<Button buttonStyle="fieldControl"><Icon icon="clearX" /></Button>}
              startControl={<Icon icon="search" />}
              placeholder="Search"
              fullWidth
            />
          </Col>
          <Col xs={5} sm={6}>
            <Button align="end" bottomMargin0 >View Full History</Button>
          </Col>
        </Row>
        <MultiColumnList fullWidth contentData={fineHistory} />
        <hr />
        <IfPermission perm="circulation.loans.collection.get">
          <IfInterface name="loan-storage" version="1.0">
            <this.connectedUserLoans onClickViewLoansHistory={this.onClickViewLoansHistory} {...this.props} />
          </IfInterface>
        </IfPermission>
        <IfPermission perm="perms.users.get">
          <this.connectedUserPermissions stripes={this.props.stripes} match={this.props.match} {...this.props} />
        </IfPermission>
        <Layer isOpen={this.props.data.editMode ? this.props.data.editMode.mode : false} label="Edit User Dialog">
          <UserForm
            initialValues={user}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.onClickCloseEditUser}
            okapi={this.props.okapi}
            optionLists={{ patronGroups: this.props.data.patronGroups, contactTypes }}
          />
        </Layer>
        <Layer isOpen={this.state.viewLoansHistoryMode} label="Loans History">
          <this.connectedLoansHistory userid={userid} stripes={this.props.stripes} onCancel={this.onClickCloseLoansHistory} />
        </Layer>
      </Pane>
    );
  }
}


export default ViewUser;
