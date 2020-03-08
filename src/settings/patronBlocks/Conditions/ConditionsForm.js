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
import stripesForm from '@folio/stripes/form';

import css from './conditions.css';

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
    onSubmit: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    stripes: stripesShape.isRequired,
    errors: PropTypes.arrayOf(PropTypes.object),
    mutator: PropTypes.shape({
      PUT:PropTypes.func.isRequired,
    })
  };

  static defaultProps = {
    errors: []
  };

  constructor(props) {
    super(props);

    const {
      id,
      name,
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    } = props.initialValues;

    this.state = {
      id,
      name,
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    };
  }

  onSave = (values) => {
    const {
      mutator: { patronBlockConditions },
      initialValues: { id: conditionId },
    } = this.props;
    const calloutMessage = (
      <SafeHTMLMessage
        id="ui-users.settings.callout.message"
        values={{ name: this.state.name }}
      />
    );
    const condition = {
      ...this.state,
      message: values.message,
    };
    patronBlockConditions.PUT(condition)
    .then(() => {
      this.callout.sendCallout({ message: calloutMessage });
    });
  };


  renderFooter = (submitting, pristine) => {
    const {
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    } = this.state;
    const formFilled = message && (blockBorrowing || blockRenewals || blockRequests);
    const isDisabled = !formFilled && (pristine || submitting);

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

  onChangeMessage = (e) => {
    this.setState({ message: e.target.value });
  }

  showValidationMessage = () => {
    const {
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    } = this.state;

    console.log('message');
    console.log(message);
    console.log(typeof(message));
    const isChecked = blockBorrowing || blockRenewals || blockRequests;
    const case1 = isChecked && !message;
    const case2 = message && !isChecked;
    let error = '';

    if(case1) {
      error = <FormattedMessage id="ui-users.settings.error.noMessage" />
    }

    if(case2) {
      error = <FormattedMessage id="ui-users.settings.error.noCheckbox" />
    }
      
    return error;
  }

  render() {
    const {
      onSubmit,
      label,
      getInitialValues,
    } = this.props;

    const {
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    } = this.state;

    return (
      <Form
        onSubmit={values => this.onSave(values)}
        initialValues={getInitialValues}
        render={({
          values,
          handleSubmit,
          submitting,
          pristine,
        }) => {
          console.log('&&& ', values);
          return (
          <form
            id="chargedOutConditionsForm"
            className={css.conditionsForm}
            onSubmit={handleSubmit}
          >
            <Pane
              defaultWidth="30%"
              fluidContentWidth
              paneTitle={label}
              footer={this.renderFooter(submitting, pristine)}
            >
              <Row>
                <Col xs={12}>
                  <Field
                    id="blockBorrowing"
                    type="checkbox"
                    name="blockBorrowing"
                    label={<FormattedMessage id="ui-users.settings.block.borrowing" />}
                    component={Checkbox}
                    checked={blockBorrowing}
                    onChange={() => this.setState(prevState => ({ 'blockBorrowing': !prevState.blockBorrowing }))}
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
                    checked={blockRenewals}
                    onChange={() => this.setState(prevState => ({ 'blockRenewals': !prevState.blockRenewals }))}
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
                    checked={blockRequests}
                    onChange={() => this.setState(prevState => ({ 'blockRequests': !prevState.blockRequests }))}
                  />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs={12}>
                  <Field
                    component={TextArea}
                    type="textarea"
                    id="message"
                    name="message"
                    value={message}
                    label={<FormattedMessage id="ui-users.settings.block.message" />}
                    validationEnabled
                    //error={this.showError()}
                    error={this.showValidationMessage()}
                    required={blockBorrowing || blockRenewals || blockRequests}
                    //onChange={(e) => this.onChangeMessage}
                  >
                  </Field>
                </Col>
              </Row>
            </Pane>
          </form>
        )}}
      />
    );
  }
}

//export default ConditionsForm;
export default stripesForm({
  form: 'patronBlocktConditions',
  navigationCheck: true,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ConditionsForm);

