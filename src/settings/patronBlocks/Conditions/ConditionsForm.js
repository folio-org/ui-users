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
  TextArea,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';

import css from '../patronBlocks.css';

function showValidationErrors(values) {
  const {
    blockBorrowing,
    blockRenewals,
    blockRequests,
    message,
  } = values;
  const isCheckboxChecked = blockBorrowing || blockRenewals || blockRequests;
  const isTextAreaValueExists = !!message;
  const errors = {};

  if (!isTextAreaValueExists && isCheckboxChecked) {
    errors.message = <FormattedMessage id="ui-users.settings.error.noMessage" />;
  }

  if (isTextAreaValueExists && !isCheckboxChecked) {
    errors.message = <FormattedMessage id="ui-users.settings.error.noCheckbox" />;
  }

  return errors;
}

class ConditionsForm extends Component {
  static propTypes = {
    initialValues: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      blockBorrowing: PropTypes.bool.isRequired,
      blockRenewals: PropTypes.bool.isRequired,
      blockRequests: PropTypes.bool.isRequired,
      message: PropTypes.string.isRequired,
    }).isRequired,
    label: PropTypes.string.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    form: PropTypes.shape({
      getState: PropTypes.func.isRequired,
    }),
    handleSubmit: PropTypes.func.isRequired,
  };

  getValueFromState = () => {
    const {
      values: {
        blockBorrowing,
        blockRenewals,
        blockRequests,
        message,
      },
    } = this.props.form.getState();

    return {
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    };
  }

  isCheckboxChecked = () => {
    const {
      blockBorrowing,
      blockRenewals,
      blockRequests,
    } = this.getValueFromState();

    return blockBorrowing || blockRenewals || blockRequests;
  }

  isTextAreaRequired = () => {
    return this.isCheckboxChecked();
  };

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

  render() {
    const {
      label,
      handleSubmit,
    } = this.props;

    return (
      <form
        data-test-conditions-form
        className={css.partonBlockForm}
        onSubmit={handleSubmit}
      >
        <Pane
          defaultWidth="30%"
          fluidContentWidth
          paneTitle={label}
          footer={this.renderFooter()}
        >
          <Row>
            <Col xs={12}>
              <Field
                data-test-block-borrowing
                id="blockBorrowing"
                name="blockBorrowing"
                type="checkbox"
                component={Checkbox}
                label={<FormattedMessage id="ui-users.settings.block.borrowing" />}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Field
                data-test-block-renewals
                id="blockRenewals"
                name="blockRenewals"
                type="checkbox"
                component={Checkbox}
                label={<FormattedMessage id="ui-users.settings.block.renew" />}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Field
                data-test-block-requests
                id="blockRequests"
                name="blockRequests"
                type="checkbox"
                component={Checkbox}
                label={<FormattedMessage id="ui-users.settings.block.request" />}
              />
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs={12}>
              <Field
                data-test-block-message
                id="message"
                name="message"
                type="textarea"
                component={TextArea}
                value={this.props.initialValues.message}
                label={<FormattedMessage id="ui-users.settings.block.message" />}
                required={this.isTextAreaRequired()}
              />
            </Col>
          </Row>
        </Pane>
      </form>
    );
  }
}

export default stripesFinalForm({
  navigationCheck: true,
  validateOnBlur: true,
  validate: showValidationErrors,
})(ConditionsForm);
