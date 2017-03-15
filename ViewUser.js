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
import IfPermission from './lib/IfPermission';

import UserForm from './UserForm';
import UserPermissions from './UserPermissions';
import UserLoans from './UserLoans';

class ViewUser extends Component {

  static propTypes = {
    params: PropTypes.object,
    data: PropTypes.shape({
      user: PropTypes.arrayOf(PropTypes.object),
      availablePermissions: PropTypes.arrayOf(PropTypes.object),
    }),
    mutator: React.PropTypes.shape({
      users: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired,
      }),
    }),
  };

  static manifest = Object.freeze({
    users: {
      type: 'okapi',
      path: 'users/:{userid}',
      clear: false,
    },
    availablePermissions: {
      type: 'okapi',
      records: 'permissions',
      path: 'perms/permissions?length=100',
    },
    usersPermissions: {
      type: 'okapi',
      records: 'permissionNames',
      DELETE: {
        pk: 'permissionName',
        path: 'perms/users/:{username}/permissions',
      },
      GET: {
        path: 'perms/users/:{username}/permissions?full=true',
      },
      path: 'perms/users/:{username}/permissions',
    },
    usersLoans: {
      type: 'okapi',
      records: 'loans',
      GET: {
        path: 'loan-storage/loans?query=(userId=:{userid} AND status="Open")',
      },
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      editUserMode: false,
    };
    this.onClickEditUser = this.onClickEditUser.bind(this);
    this.onClickCloseEditUser = this.onClickCloseEditUser.bind(this);
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

  update(data) {
    // eslint-disable-next-line no-param-reassign
    if (data.creds) delete data.creds; // not handled on edit (yet at least)
    this.props.mutator.users.PUT(data).then(() => {
      this.onClickCloseEditUser();
    });
  }

  render() {
    const fineHistory = [{ 'Due Date': '11/12/2014', Amount: '34.23', Status: 'Unpaid' }];

    const { data: { users, availablePermissions, usersPermissions, usersLoans }, params: { userid } } = this.props;

    const detailMenu = (<PaneMenu>
      <IfPermission {...this.props} perm="users.edit">
        <button onClick={this.onClickEditUser} title="Edit User"><Icon icon="edit" />Edit</button>
      </IfPermission>
    </PaneMenu>);

    if (!users || users.length === 0 || !userid) return <div />;

    if (!_.get(this.props, ['currentPerms', 'users.read.basic'])) {
      return (<div>
        <h2>Permission Error</h2>
        <p>Sorry - your user permissions do not allow access to this page.</p>
      </div>);
    }

    const user = users.find(u => u.id === userid);
    if (!user) return <div />;
    const userStatus = (_.get(user, ['active'], '') ? 'active' : 'inactive');

    return (
      <Pane defaultWidth="fill" paneTitle="User Details" lastMenu={detailMenu}>
        <Row>
          <Col xs={8} >
            <Row>
              <Col xs={12}>
                <h2>{_.get(user, ['personal', 'last_name'], '')}, {_.get(user, ['personal', 'first_name'], '')}</h2>
              </Col>
            </Row>
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
                <KeyValue label="Patron group" value={_.get(user, ['patron_group'], '')} />
              </Col>
            </Row>
          </Col>
          <Col xs={4} >
            <img className="floatEnd" src="http://placehold.it/175x175" role="presentation" />
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
        <UserLoans loans={usersLoans} />
        <UserPermissions availablePermissions={availablePermissions} usersPermissions={usersPermissions} viewUserProps={this.props} />
        <Layer isOpen={this.state.editUserMode} label="Edit User Dialog">
          <UserForm
            onSubmit={(record) => { this.update(record); }}
            initialValues={user}
            onCancel={this.onClickCloseEditUser}
          />
        </Layer>
      </Pane>
    );
  }
}


export default ViewUser;
