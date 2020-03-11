import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field, Form } from 'react-final-form';

import {
  Row,
  Col,
  Checkbox,
  Pane,
  PaneFooter,
  Button,
  TextArea,
} from '@folio/stripes/components';
import { stripesShape } from '@folio/stripes-core';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import stripesFinalForm from '@folio/stripes/final-form';

import css from './conditions.css';

const showValidationMessage = (values) => {
  const {
    blockBorrowing,
    blockRenewals,
    blockRequests,
    message
  } = values;
  const errors = {};
  const isChecked = blockBorrowing || blockRenewals || blockRequests;
  const case1 = isChecked && !message;
  const case2 = message && !isChecked;

  if (case1) {
    errors.message = <FormattedMessage id="ui-users.settings.error.noMessage" />;
  }

  if (case2) {
    errors.message = <FormattedMessage id="ui-users.settings.error.noCheckbox" />;
  }

  return errors;
};

const ConditionsForm = (props) => {
  const onSave = (values) => {
    console.log('values onSave');
    console.log(values);
    const {
      mutator: { patronBlockConditions },
      initialValues: {
        id,
        name,
      },
    } = props;
    const calloutMessage = (
      <SafeHTMLMessage
        id="ui-users.settings.callout.message"
        values={{ name }}
      />
    );
    const condition = {
      ...values,
      id,
      name
      // message: values.message,
    };
    patronBlockConditions.PUT(condition)
      .then(() => {
        this.callout.sendCallout({ message: calloutMessage });
      });
  };


  const renderFooter = (submitting, pristine, values) => {
    const {
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message
    } = values;
    const formFilled = message && (blockBorrowing || blockRenewals || blockRequests);

    const isDisabled = (pristine || submitting) && !formFilled;

    return (
      <PaneFooter
        renderEnd={(
          <Button
            data-test-charged-out-conditions-save-button
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

  const isTextAreaRequired = () => {
    const { values } = props.form.getState();

    return values?.blockBorrowing || values?.blockRenewals || values?.blockRequests;
  };

  const {
    label,
    initialValues: {
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    },
    pristine,
    submitting,
    onCancel,
    initialValues,
    handleSubmit,
    form: { getValues },
    error,
    validate,
  } = props;

  console.log('55555555');
  console.log(props);
  console.log('form 5555');
  console.log(validate);

  return (
    <form
      id="chargedOutConditionsForm"
      className={css.conditionsForm}
    >
      <Pane
        defaultWidth="30%"
        fluidContentWidth
        paneTitle={label}
        footer={renderFooter(submitting, pristine, initialValues)}
      >
        <Row>
          <Col xs={12}>
            <Field
              id="blockBorrowing"
              type="checkbox"
              name="blockBorrowing"
              label={<FormattedMessage id="ui-users.settings.block.borrowing" />}
              component={Checkbox}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              id="blockRenewals"
              type="checkbox"
              name="blockRenewals"
              label={<FormattedMessage id="ui-users.settings.block.renew" />}
              component={Checkbox}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Field
              id="blockRequests"
              type="checkbox"
              name="blockRequests"
              label={<FormattedMessage id="ui-users.settings.block.request" />}
              component={Checkbox}
            />
          </Col>
        </Row>
        <br />
        <Row>
          <Col xs={12}>
            <Field
              name="message"
              component={TextArea}
              type="textarea"
              id="message"
              label={<FormattedMessage id="ui-users.settings.block.message" />}
              required={isTextAreaRequired()}
            />
          </Col>
        </Row>
      </Pane>
    </form>
  );
};

ConditionsForm.propTypes = {
  initialValues: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    blockBorrowing: PropTypes.bool.isRequired,
    blockRenewals: PropTypes.bool.isRequired,
    blockRequests: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  form: PropTypes.shape({
    getState: PropTypes.func.isRequired,
  }).object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  stripes: stripesShape.isRequired,
  mutator: PropTypes.shape({
    PUT: PropTypes.func.isRequired,
  })
};

// export default ConditionsForm;
export default stripesFinalForm({
  validate: showValidationMessage,
  navigationCheck: true,
  validateOnBlur: true,
})(ConditionsForm);
