import React from 'react';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import PropTypes from 'prop-types';
import { uniqBy } from 'lodash';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { OnChange } from 'react-final-form-listeners';

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
      servicePoints: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    onToggle: PropTypes.func,
    formData: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    form: PropTypes.object,
    setButtonRef: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      addingServicePoint: false,
      userServicePoints: props.initialValues.servicePoints || [],
    };
  }

  onAddServicePoints = newServicePoints => {
    const { form } = this.props;
    const userServicePoints = newServicePoints.sort(
      (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    form.change('servicePoints', []);
    userServicePoints.map(sp => this.userServicePoints.push(sp));
  }

  onRemoveServicePoint = (index) => {
    this.userServicePoints.remove(index);
  }

  renderServicePoint = (_, index) => {
    const sp = this.userServicePoints.value[index];

    return (
      <li
        data-test-service-point={sp.id}
        key={sp.id}
      >
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
    this.userServicePoints = fields;
    return (
      <List
        items={this.userServicePoints}
        itemFormatter={this.renderServicePoint}
        isEmptyMessage={<FormattedMessage id="ui-users.sp.noServicePoints" />}
      />
    );
  }

  renderAddServicePointButton = () => {
    const { setButtonRef } = this.props;
    return (
      <Row end="xs">
        <Col>
          <Button
            id="add-service-point-btn"
            buttonRef={setButtonRef}
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
    const { intl } = this.props;
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
          <Field
            label={`${intl.formatMessage({ id: 'ui-users.sp.servicePointPreference' })}} *`}
            name="preferredServicePoint"
            id="servicePointPreference"
            component={Select}
            placeholder={intl.formatMessage({ id: 'ui-users.sp.selectServicePoint' })}
            dataOptions={dataOptions}
          />
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
    const {
      addingServicePoint,
      userServicePoints,
    } = this.state;

    const servicePoints = uniqBy(this.props.formData?.servicePoints, 'id');

    return (
      <AddServicePointModal
        onClose={() => this.setState({ addingServicePoint: false })}
        onSave={this.onAddServicePoints}
        open={addingServicePoint}
        servicePoints={servicePoints}
        assignedServicePoints={userServicePoints}
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
          <OnChange name="servicePoints">
            {userServicePoints => this.setState({ userServicePoints })}
          </OnChange>
        </IfInterface>
      </IfPermission>
    );
  }
}

export default injectIntl(EditServicePoints);
