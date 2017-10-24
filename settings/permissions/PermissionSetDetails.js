import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import ContainedPermissions from './ContainedPermissions';

class PermissionSetDetails extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    initialValues: PropTypes.object,
  };

  constructor(props) {
    super();
    this.containedPermissions = props.stripes.connect(ContainedPermissions);
  }

  render() {
    const selectedSet = this.props.initialValues;

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
              <KeyValue label="Policy Name" value={_.get(selectedSet, ['displayName'], 'Untitled Permission Set')} />
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs={12}>
              <KeyValue label="Policy Description" value={_.get(selectedSet, ['description'], '-')} />
            </Col>
          </Row>
        </section>

        <this.containedPermissions
          addPermission={() => {}}
          removePermission={() => {}}
          selectedSet={selectedSet}
          permToRead="perms.permissions.get"
          permToDelete="perms.permissions.item.put"
          permToModify="perms.permissions.item.put"
          stripes={this.props.stripes}
          editable={false}
          {...this.props}
        />
      </div>
    );
  }
}

export default PermissionSetDetails;
