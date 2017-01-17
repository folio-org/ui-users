import _ from 'lodash';
import React, { Component, PropTypes } from 'react' // eslint-disable-line
import { connect } from 'stripes-connect'; // eslint-disable-line
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
    data: PropTypes.shape({
      user: PropTypes.arrayOf(PropTypes.object),
    }),
    mutator: React.PropTypes.shape({
      user: React.PropTypes.shape({
        PUT: React.PropTypes.func.isRequired,
      }),
    }),
  };

  static manifest = {
    user: {
      type: 'okapi',
      path: 'users/:{userid}',
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      editUserMode: false,
    };
    this.onClickEditUser = this.onClickEditUser.bind(this);
    this.onClickCloseEditUser = this.onClickCloseEditUser.bind(this);
  }

  // EditUser Handlers
  onClickEditUser() {
    console.log('edit Clicked');
    this.setState({
      editUserMode: true,
    });
  }

  onClickCloseEditUser() {
    this.setState({
      editUserMode: false,
    });
  }

  update(data) {
    this.props.mutator.user.PUT(data).then(() => {
      this.onClickCloseEditUser();
    });
  }

  render() {
    const fineHistory = [{ 'Due Date': '11/12/2014', 'Amount': '34.23', 'Status': 'Unpaid' }]; // eslint-disable-line quote-props
    const availablePermissions = [{id: 3, name: "Can view user profile"}, {id: 2, name: "Can edit user profile"}, {id: 1, name: "Can create new user"}];

    const detailMenu = <PaneMenu><button onClick={this.onClickEditUser} title="Edit User"><Icon icon="edit" />Edit</button></PaneMenu>;

    const { data: { user } } = this.props;
    if (!user || user.length === 0) return <div />;
    return (
      <Pane defaultWidth="fill" paneTitle="User Details" lastMenu={detailMenu}>
        <Row>
          <Col xs={8} >
            <Row>
              <Col xs={12}>
                <h2>{_.get(user[0], ['personal', 'last_name'], '')}, {_.get(user[0], ['personal', 'first_name'], '')}</h2>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <KeyValue label="Email" value={_.get(user[0], ['personal', 'email'], '')} />
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
        <UserPermissions availablePermissions={availablePermissions} />



        <Layer isOpen={this.state.editUserMode} label="Edit User Dialog">
          <UserForm
            onSubmit={(record) => { this.update(record); }}
            initialValues={user[0]}
            onCancel={this.onClickCloseEditUser}
          />
        </Layer>
      </Pane>
    );
  }
}

export default connect(ViewUser, 'users');
