import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Pane from '@folio/stripes-components/lib/Pane';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

class PermissionSetDetails extends React.Component {
  static propTypes = {
    initialValues: PropTypes.object,
  };

  render() {
    const { stripes, initialValues } = this.props;
    const selectedSet = initialValues;

    return (
      <div>
        <section>
          <Row>
            <Col xs={12}>
              <h2 style={{ marginTop: '0' }}>About</h2>
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs={12}>
              <KeyValue label="Policy Name" value={_.get(selectedSet, ['displayName'], '')} />
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs={12}>
              <KeyValue label="Policy Description" value={_.get(selectedSet, ['description'], '-')} />
            </Col>
          </Row>
        </section>
        { /*
            <this.containedPermissions
              addPermission={this.addPermission}
              removePermission={this.removePermission}
              selectedSet={this.state.selectedSet}
              permToRead="perms.permissions.get"
              permToDelete="perms.permissions.item.put"
              permToModify="perms.permissions.item.put"
              stripes={this.props.stripes}
              editable
              {...this.props}
            /> */
        }
      </div>
    );
  }
}

export default PermissionSetDetails;
