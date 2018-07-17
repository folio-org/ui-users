import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Field } from 'redux-form';

import { Accordion } from '@folio/stripes-components/lib/Accordion';
import Button from '@folio/stripes-components/lib/Button';
import EmptyMessage from '@folio/stripes-components/lib/EmptyMessage';
import Layout from '@folio/stripes-components/lib/Layout';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';

import AddServicePointModal from '../../AddServicePointModal';

class EditServicePoints extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
      connect: PropTypes.func.isRequired,
    }).isRequired,
    parentResources: PropTypes.object,
    // initialValues: PropTypes.object,
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    accordionId: PropTypes.string.isRequired,
  }

  state = {
    addingServicePoint: false,
    servicePointOptions: [],
  }

  static getDerivedStateFromProps(props, state) {
    const servicePoints = get(props.parentResources, ['servicePoints', 'records'], []);
    if (servicePoints.length !== state.servicePointOptions.length) {
      return {
        servicePointOptions: servicePoints.map(sp => ({ value: sp.id, label: sp.name })),
      };
    }

    return null;
  }

  onAddServicePoints = (servicePoints) => {
    console.log('onAddServicePoints', servicePoints);
  }

  renderServicePoints(servicePoints) {
    const { formatMessage } = this.props.stripes.intl;

    return (
      <Row>
        <Col xs={12} md={3}>
          <Field
            label={formatMessage({ id: 'ui-users.sp.servicePointPreference' })}
            name="servicePointPreference"
            id="servicePointPreference"
            component={Select}
            placeholder={formatMessage({ id: 'ui-users.sp.selectServicePoint' })}
            dataOptions={this.state.servicePointOptions}
          />
          <AddServicePointModal
            onClose={() => this.setState({ addingServicePoint: false })}
            onSave={this.onAddServicePoints}
            open={this.state.addingServicePoint}
            servicePoints={servicePoints}
            stripes={this.props.stripes}
          />
        </Col>
      </Row>
    );
  }

  render() {
    const { formatMessage } = this.props.stripes.intl;
    const servicePoints = get(this.props.parentResources, ['servicePoints', 'records'], []);

    return (
      <Accordion
        label={formatMessage({ id: 'ui-users.sp.servicePoints' })}
        open={this.props.expanded}
        id={this.props.accordionId}
        onToggle={this.props.onToggle}
      >
        <Layout className="right">
          <Button onClick={() => this.setState({ addingServicePoint: true })}>
            {formatMessage({ id: 'ui-users.sp.addServicePoints' })}
          </Button>
        </Layout>
        {
          servicePoints && servicePoints.length ?
            this.renderServicePoints(servicePoints)
            :
            <EmptyMessage>{formatMessage({ id: 'ui-users.sp.noServicePoints' })}</EmptyMessage>
        }
      </Accordion>
    );
  }
}

export default EditServicePoints;
