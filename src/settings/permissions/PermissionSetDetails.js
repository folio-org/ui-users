import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  KeyValue,
  Row,
  Col,
  Accordion,
  ExpandAllButton,
  Headline
} from '@folio/stripes/components';
import { ViewMetaData } from '@folio/stripes/smart-components';

import RenderPermissions from '../../components/RenderPermissions';

class PermissionSetDetails extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    initialValues: PropTypes.object,
  };

  constructor(props) {
    super();
    this.renderPermissions = props.stripes.connect(RenderPermissions);
    this.handleSectionToggle = this.handleSectionToggle.bind(this);
    this.handleExpandAll = this.handleExpandAll.bind(this);
    this.state = {
      sections: {
        generalInformation: true,
        assignedPermissions: true,
      },
    };

    this.cViewMetaData = props.stripes.connect(ViewMetaData);
  }

  handleExpandAll(sections) {
    this.setState((curState) => {
      const newState = _.cloneDeep(curState);
      newState.sections = sections;
      return newState;
    });
  }

  handleSectionToggle({ id }) {
    this.setState((curState) => {
      const newState = _.cloneDeep(curState);
      newState.sections[id] = !newState.sections[id];
      return newState;
    });
  }

  render() {
    const { initialValues: selectedSet } = this.props;
    const { sections } = this.state;
    const untitledPermissionSetMessage = <FormattedMessage id="ui-users.permissions.untitledPermissionSet" />;

    return (
      <div>
        <Row end="xs">
          <Col xs>
            <ExpandAllButton
              accordionStatus={sections}
              onToggle={this.handleExpandAll}
            />
          </Col>
        </Row>
        <Accordion
          open={sections.generalInformation}
          id="generalInformation"
          onToggle={this.handleSectionToggle}
          label={
            <Headline size="large" tag="h3">
              <FormattedMessage id="ui-users.permissions.generalInformation" />
            </Headline>
          }
        >
          {selectedSet.metadata && selectedSet.metadata.createdDate &&
            <Row>
              <Col xs={12}>
                <this.cViewMetaData metadata={selectedSet.metadata} />
              </Col>
            </Row>
          }
          <Row>
            <Col xs={12}>
              <section>
                <KeyValue
                  label={<FormattedMessage id="ui-users.permissions.permissionSetName" />}
                  value={_.get(selectedSet, ['displayName'], untitledPermissionSetMessage)}
                />
                <KeyValue
                  label={<FormattedMessage id="ui-users.description" />}
                  value={_.get(selectedSet, ['description'], '-')}
                />
              </section>
            </Col>
          </Row>
        </Accordion>

        <this.renderPermissions
          expanded={sections.assignedPermissions}
          onToggle={this.handleSectionToggle}
          accordionId="assignedPermissions"
          heading={<FormattedMessage id="ui-users.permissions.assignedPermissions" />}
          listedPermissions={selectedSet.subPermissions}
          permToRead="perms.permissions.get"
          permToDelete="perms.permissions.item.put"
          permToModify="perms.permissions.item.put"
          {...this.props}
        />
      </div>
    );
  }
}

export default PermissionSetDetails;
