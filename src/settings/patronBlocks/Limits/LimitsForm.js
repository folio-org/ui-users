import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Row,
  Col,
  Checkbox,
  Pane,
  PaneFooter,
  Button,
  TextField,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';


class LimitsForm extends Component {

  static defaultProps = {
    patronBlockConditions: [],
  }

  renderConditions = () => {
    const {
      patronBlockConditions,
    } = this.props;

    return (
      patronBlockConditions.map((condition) => (
        <>
          <Row>
            <Col xs={12}>
              <b>{condition}</b>
            </Col>
          </Row>
          <Row>
            <Col xs={3}>
              <Field
                data-test-limit-field
                id={condition}
                name={condition}
                type="text"
                component={TextField}
              />
            </Col>
          </Row>
        </>
      ))
    );
  }

  renderFooter = () => {
    const {
      pristine,
      submitting,
    } = this.props;
    const isDisabled = pristine || submitting;

    return (
      <PaneFooter
        renderEnd={(
          <Button
            data-test-limits-save-button
            type="submit"
            buttonStyle="primary paneHeaderNewButton"
            disabled={isDisabled}
            marginBottom0
          >
            <FormattedMessage id="stripes-core.button.save" />
          </Button>
        )}
      />
    );
  };

  render() {
    const {
      handleSubmit,
    } = this.props;

    return (
      <form
        onSubmit={handleSubmit}
      >
        { this.renderConditions() }
      </form>
    );
  }
}

export default stripesFinalForm({
  //navigationCheck: true,
  //validateOnBlur: true,
  //validate: showValidationErrors,
})(LimitsForm);
