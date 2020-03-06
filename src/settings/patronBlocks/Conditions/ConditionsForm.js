import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  FormattedMessage,
} from 'react-intl';
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
import stripesForm from '@folio/stripes/form';
import { stripesShape } from '@folio/stripes-core';

import css from './conditions.css';

class ConditionsForm extends Component {
  state = { // TODO:: Fix state!!!!!
    id: this.props.initialValues.id,
    name: this.props.initialValues.name,
    blockBorrowing: this.props.initialValues.blockBorrowing,
    blockRenewals: this.props.initialValues.blockRenewals,
    blockRequests: this.props.initialValues.blockRequests,
    message: this.props.initialValues.message,
  };

  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    blockBorrowing: PropTypes.bool.isRequired,
    blockRenewals: PropTypes.bool.isRequired,
    blockRequests: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,

    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    label: PropTypes.string.isRequired,
    stripes: stripesShape.isRequired,
    errors: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    errors: []
  };

  onSave = (values) => {

  };

  renderFooter = () => {
    const {
      pristine,
      submitting,
      handleSubmit,
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
            <FormattedMessage id="stripes-core.button.save"/>
          </Button>
        )}
      />
    );
  };

  render() {
    const {
      onSubmit,
      label,
      pristine,
      submitting,
      handleSubmit,
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
        onSubmit={values => console.log(values)}
        initialValues={getInitialValues}
        render={({ handleSubmit }) => (
          <form
            id="chargedOutConditionsForm"
            className={css.conditionsForm}
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
                    id="blockBorrowing"
                    type="checkbox"
                    name="blockBorrowing"
                    label={<FormattedMessage id="ui-users.settings.block.borrowing"/>}
                    component={Checkbox}
                    checked={blockBorrowing}
                    onChange={(event) => this.onToggleValue(event, 'blockBorrowing')}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <Field
                    id="blockRenewals"
                    type="checkbox"
                    name="blockRenewals"
                    label={<FormattedMessage id="ui-users.settings.block.renew"/>}
                    component={Checkbox}
                    checked={blockRenewals}
                    onChange={(event) => this.onToggleValue(event, 'blockRenewals')}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <Field
                    id="blockRequests"
                    type="checkbox"
                    name="blockRequests"
                    label={<FormattedMessage id="ui-users.settings.block.request"/>}
                    component={Checkbox}
                    checked={blockRequests}
                    onChange={(event) => this.onToggleValue(event, 'blockRequests')}
                  />
                </Col>
              </Row>
              <br/>
              <Row>
                <Col xs={12}>
                  <Field
                    component={TextArea}
                    type="textarea"
                    id="message"
                    name="message"
                    label={<FormattedMessage id="ui-users.settings.block.message"/>}
                  />
                </Col>
              </Row>
            </Pane>
          </form>
        )}
      />
    );
  }

  onToggleValue = (event, propsName) => {}
}

export default ConditionsForm;
