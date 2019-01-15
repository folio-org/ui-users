import React from 'react';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import PropTypes from 'prop-types';
import { get, uniqBy } from 'lodash';
import { Field, FieldArray } from 'redux-form';
import {
  Icon,
  Button,
  Select,
  Row,
  Col,
  Accordion,
  Badge,
  List,
  Headline
} from '@folio/stripes/components';

import {
  IfInterface,
  IfPermission,
} from '@folio/stripes/core';

import AddServicePointModal from '../../AddServicePointModal';

class EditServicePoints extends React.Component {
  static propTypes = {
    accordionId: PropTypes.string.isRequired,
    expanded: PropTypes.bool,
    initialValues: PropTypes.shape({
      servicePoints: PropTypes.array,
    }).isRequired,
    onToggle: PropTypes.func,
    parentResources: PropTypes.shape({
      servicePoints: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }).isRequired,
    }).isRequired,
    stripes: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      addingServicePoint: false,
      userServicePoints: props.initialValues.servicePoints || [],
    };
  }

  onAddServicePoints = (newServicePoints) => {
    const userServicePoints = uniqBy([
      ...this.userServicePoints.getAll(),
      ...newServicePoints,
    ], 'id').sort(((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })));

    this.userServicePoints.removeAll();
    userServicePoints.map(sp => this.userServicePoints.push(sp));
  }

  onRemoveServicePoint = (index) => {
    this.userServicePoints.remove(index);
  }

  renderServicePoint = (_, index) => {
    const sp = this.userServicePoints.get(index);

    return (
      <li key={sp.id}>
        {sp.name}
        <FormattedMessage id="ui-users.sp.removeServicePoint">
          {aria => (
            <Button
              buttonStyle="fieldControl"
              align="end"
              type="button"
              id={`clickable-remove-service-point-${sp.id}`}
              onClick={() => this.onRemoveServicePoint(index)}
              aria-label={`${aria}: ${sp.name}`}
            >
              <Icon icon="times-circle" />
            </Button>
          )}
        </FormattedMessage>
      </li>
    );
  }

  renderServicePointsComponent = ({ fields }) => {
    // redux-form sets the userServicePoints array asynchronously via redux. Since we rely on
    // the list of the user's service points to populate the preferred service point
    // <Select>, we need to store the array in local state as well. This doesn't feel
    // great since we're duplicating data but other solutions are hackish in that they
    // assume behaviour from redux-form which may not stay constant going forward.
    this.setState({ userServicePoints: fields.getAll() });

    this.userServicePoints = fields;

    return (
      <List
        items={this.userServicePoints}
        itemFormatter={this.renderServicePoint}
        isEmptyMessage={<FormattedMessage id="ui-users.sp.noServicePoints" />}
      />
    );
  }

  renderAddServicePointButton() {
    return (
      <Row end="xs">
        <Col>
          <Button
            id="add-service-point-btn"
            onClick={() => this.setState({ addingServicePoint: true })}
          >
            <FormattedMessage id="ui-users.sp.addServicePoints">
              {(message) => `+ ${message}`}
            </FormattedMessage>
          </Button>
        </Col>
      </Row>
    );
  }

  renderPreferredServicePointSelect() {
    const { userServicePoints } = this.state;

    if (userServicePoints.length === 0) return null;

    const dataOptions = [
      {
        label: this.props.intl.formatMessage({ id: 'ui-users.sp.preferredSPNone' }),
        value: '-',
      },
      ...userServicePoints.map(sp => ({ label: sp.name, value: sp.id })),
    ];

    return (
      <Row>
        <Col xs={12} md={6}>
          <FormattedMessage id="ui-users.sp.selectServicePoint">
            {placeholder => (
              <Field
                label={(
                  <FormattedMessage id="ui-users.sp.servicePointPreference">
                    {(msg) => msg + ' *'}
                  </FormattedMessage>
                )}
                name="preferredServicePoint"
                id="servicePointPreference"
                component={Select}
                placeholder={placeholder}
                dataOptions={dataOptions}
              />
            )}
          </FormattedMessage>
        </Col>
      </Row>
    );
  }

  renderServicePoints() {
    return (
      <Row>
        <Col xs={12}>
          <FieldArray
            name="servicePoints"
            component={this.renderServicePointsComponent}
          />
        </Col>
      </Row>
    );
  }

  renderAddServicePointModal() {
    const servicePoints = get(this.props.parentResources, ['servicePoints', 'records'], []);

    return (
      <AddServicePointModal
        onClose={() => this.setState({ addingServicePoint: false })}
        onSave={this.onAddServicePoints}
        open={this.state.addingServicePoint}
        servicePoints={servicePoints}
        stripes={this.props.stripes}
      />
    );
  }

  render() {
    return (
      <IfPermission perm="inventory-storage.service-points-users.item.post,inventory-storage.service-points-users.item.put">
        <IfInterface name="service-points-users" version="1.0">
          <Accordion
            label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.sp.servicePoints" /></Headline>}
            open={this.props.expanded}
            id={this.props.accordionId}
            onToggle={this.props.onToggle}
            displayWhenClosed={<Badge>{(this.userServicePoints && this.userServicePoints.length) || 0}</Badge>}
          >
            <div>{this.renderAddServicePointButton()}</div>
            {this.renderPreferredServicePointSelect()}
            {this.renderServicePoints()}
            {this.renderAddServicePointModal()}
          </Accordion>
        </IfInterface>
      </IfPermission>
    );
  }
}

export default injectIntl(EditServicePoints);
