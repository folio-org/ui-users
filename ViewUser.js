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

import UserForm from './UserForm';
import UserPermissions from './UserPermissions';
import UserLoans from './UserLoans';
import LoansHistory from './LoansHistory';

class ViewUser extends Component {

  static propTypes = {
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
    }).isRequired,
    paneWidth: PropTypes.string.isRequired,
    data: PropTypes.shape({
      user: PropTypes.arrayOf(PropTypes.object),
      patronGroups: PropTypes.arrayOf(PropTypes.object),
    }),
    mutator: React.PropTypes.shape({
      selUser: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired,
      }),
    }),
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    onClose: PropTypes.func,
    okapi: PropTypes.object,
  };

  static manifest = Object.freeze({
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
      editUserMode: false,
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

  // EditUser Handlers
  onClickEditUser(e) {
    if (e) e.preventDefault();
    this.setState({
      editUserMode: true,
    });
  }

  onClickCloseEditUser(e) {
    if (e) e.preventDefault();
    this.setState({
      editUserMode: false,
    });
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
    // eslint-disable-next-line no-param-reassign
    if (data.available_patron_groups) delete data.available_patron_groups;
    this.props.mutator.selUser.PUT(data).then(() => {
      this.onClickCloseEditUser();
    });
  }

  render() {
    const fineHistory = [{ 'Due Date': '11/12/2014', Amount: '34.23', Status: 'Unpaid' }];

    const { data: { selUser, patronGroups }, match: { params: { userid } } } = this.props;

    const detailMenu = (<PaneMenu>
      <IfPermission {...this.props} perm="users.item.put">
        <button onClick={this.onClickEditUser} title="Edit User"><Icon icon="edit" />Edit</button>
      </IfPermission>
    </PaneMenu>);

    if (!selUser || selUser.length === 0 || !userid) return <div />;

    const user = selUser.find(u => u.id === userid);
    if (!user) return <div />;
    const userStatus = (_.get(user, ['active'], '') ? 'active' : 'inactive');
    const patronGroupId = _.get(user, ['patronGroup'], '');
    const patronGroup = patronGroups.find(g => g.id === patronGroupId) || { group: '' };

    return (
      <Pane defaultWidth={this.props.paneWidth} paneTitle="User Details" lastMenu={detailMenu} dismissible onClose={this.props.onClose}>
        <Row>
          <Col xs={8} >
            <Row>
              <Col xs={12}>
                <h2>{_.get(user, ['personal', 'lastName'], '')}, {_.get(user, ['personal', 'firstName'], '')}</h2>
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
                <KeyValue label="Patron group" value={patronGroup.desc} />
              </Col>
            </Row>
          </Col>
          <Col xs={4} >
            <img className="floatEnd" src="https://placehold.it/175x175" role="presentation" />
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
        <IfPermission {...this.props} perm="circulation.loans.collection.get">
          <this.connectedUserLoans onClickViewLoansHistory={this.onClickViewLoansHistory} {...this.props} />
        </IfPermission>
        <IfPermission {...this.props} perm="perms.users.get">
          <this.connectedUserPermissions stripes={this.props.stripes} match={this.props.match} {...this.props} />
        </IfPermission>
        <Layer isOpen={this.state.editUserMode} label="Edit User Dialog">
          <UserForm
            initialValues={_.merge(user, { available_patron_groups: this.props.data.patronGroups })}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.onClickCloseEditUser}
            okapi={this.props.okapi}
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
