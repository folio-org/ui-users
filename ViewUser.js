import _ from 'lodash'; // eslint-disable-line
import React, { Component, PropTypes } from 'react' // eslint-disable-line
import { connect } from '@folio/stripes-connect'; // eslint-disable-line
import Pane from '@folio/stripes-components/lib/Pane' // eslint-disable-line
import PaneMenu from '@folio/stripes-components/lib/PaneMenu' // eslint-disable-line
import Button from '@folio/stripes-components/lib/Button' // eslint-disable-line
import KeyValue from '@folio/stripes-components/lib/KeyValue' // eslint-disable-line
import {Row, Col} from 'react-bootstrap' // eslint-disable-line
import TextField from '@folio/stripes-components/lib/TextField' // eslint-disable-line
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList' // eslint-disable-line
import Icon from '@folio/stripes-components/lib/Icon' // eslint-disable-line
import Layer from '@folio/stripes-components/lib/Layer'; // eslint-disable-line

import UserForm from './UserForm';
import UserPermissions from './UserPermissions';

class ViewUser extends Component {

  static propTypes = {
    params: PropTypes.object,
    data: PropTypes.shape({
      user: PropTypes.arrayOf(PropTypes.object),
      availablePermissions: PropTypes.arrayOf(PropTypes.object)
    }),
    mutator: React.PropTypes.shape({
      user: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired
      }),
      usersPermissions: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired
      })
    })
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
      path: "perms/permissions",
    },
    usersPermissions: {
      type: 'okapi',
      records: "permissionNames",
      GET: { 
        path: (queryParams, _pathComponents, _resourceValues) => {
          return _pathComponents.username?`perms/users/${_pathComponents.username}/permissions?full=true`:undefined;
        }
      },
      path: (queryParams, _pathComponents, _resourceValues) => {
        return _pathComponents.username?`perms/users/${_pathComponents.username}/permissions`:undefined;
      }
    }

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
    this.props.mutator.users.PUT(data, this.props).then(() => {
      this.onClickCloseEditUser();
    });
  }

  render() {
    const fineHistory = [{ 'Due Date': '11/12/2014', 'Amount': '34.23', 'Status': 'Unpaid' }]; // eslint-disable-line quote-props
    
    const detailMenu = <PaneMenu><button onClick={this.onClickEditUser} title="Edit User"><Icon icon="edit" />Edit</button></PaneMenu>;

    const { data: { users, availablePermissions, usersPermissions }, params: { userid } } = this.props;

    console.log(this.props);

    let count = 0;
    
    if (!users || users.length === 0 || !userid) return <div />;
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
        <UserPermissions availablePermissions={availablePermissions} usersPermissions={usersPermissions} usersPermissionsMutators={this.props.mutator.usersPermissions} />



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

export default connect(ViewUser, '@folio-sample-modules/ui-users');
