import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  FormattedMessage, intlShape,
} from 'react-intl';
import {
  Field,
  FieldArray,
  getFormValues,
} from 'redux-form';

import {
  Row,
  Col,
  Checkbox,
  Pane,
  PaneFooter,
  Button,
  TextArea,
} from '@folio/stripes/components';
import { ConfigManager } from '@folio/stripes/smart-components';
import stripesForm from '@folio/stripes/form';
import { stripesShape } from '@folio/stripes-core';

import css from '../conditions.css';

class ChargedOutConditionsForm extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    stripes: stripesShape.isRequired,
  };

  constructor(props) {
    super(props);
  }

  onSave = (values) => {
    
  }

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
            <FormattedMessage id="stripes-core.button.save" />
          </Button>
        )}
      />
    );
  }

  getCurrentValues = () => {
    const { store } = this.props.stripes;
    const state = store.getState();

    return getFormValues('chargedOutConditionsForm')(state) || {};
  }

  render() {
    const { label } = this.props;

    return (
      <form
        id="chargedOutConditionsForm"
        className={css.conditionsForm}
        onSubmit={(values)=> this.onSave(values)}
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
                component={Checkbox}
                type="checkbox"
                id="blockBorrowing"
                name="blockBorrowing"
                label={<FormattedMessage id="ui-users.settings.block.borrowing" />}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Field
                component={Checkbox}
                type="checkbox"
                id="blockRenewals"
                name="blockRenewals"
                label={<FormattedMessage id="ui-users.settings.block.renew" />}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Field
                component={Checkbox}
                type="checkbox"
                id="blockRequests"
                name="blockRequests"
                label={<FormattedMessage id="ui-users.settings.block.request" />}
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
                label={<FormattedMessage id="ui-users.settings.block.message" />}
              />
            </Col>
          </Row>
        </Pane>
      </form>
    );
  }
}

export default injectIntl(
  stripesForm({
    form: 'chargedOutConditionsForm',
    navigationCheck: true,
    enableReinitialize: true,
  })(ChargedOutConditionsForm)
);
