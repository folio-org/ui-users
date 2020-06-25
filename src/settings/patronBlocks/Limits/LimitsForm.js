import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import {
  toNumber,
  map,
} from 'lodash';

import {
  Row,
  Col,
  Pane,
  PaneFooter,
  Button,
  Label,
  TextField,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';

import { feeFineBalanceId } from '../../../constants';

import css from '../patronBlocks.css';

function isInteger(value) {
  return value % 1 === 0;
}

function validation(value, min, max) {
  const numberValue = toNumber(value);
  const errorMessage = (
    <FormattedMessage
      id="ui-users.settings.limits.validation.message"
      values={{ min, max }}
    />
  );

  if (numberValue < min || numberValue > max) {
    return errorMessage;
  }

  if (isInteger(min) && !isInteger(value) && !Number.isNaN(value)) {
    return errorMessage;
  }

  return null;
}

function limitsValidation(value) {
  return validation(value, 1, 999999);
}

function feeFineLimitsValidation(value) {
  return validation(value, 0.01, 999999.99);
}

class LimitsForm extends Component {
  static propTypes = {
    patronGroup: PropTypes.string.isRequired,
    patronBlockConditions: PropTypes.arrayOf(
      PropTypes.object
    ),
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  }

  static defaultProps = {
    patronBlockConditions: [],
  }

  renderConditions = () => {
    const { patronBlockConditions } = this.props;

    return (
      map(patronBlockConditions, ({ name: condition, id }) => {
        return (
          <div key={id}>
            <Row>
              <Col xs={12}>
                <Label
                  data-test-limit-label
                  tagName="label"
                  htmlFor={id}
                >
                  <b>{condition}</b>
                </Label>
              </Col>
            </Row>
            <Row>
              <Col xs={4}>
                <Field
                  data-test-limit-field
                  id={id}
                  component={TextField}
                  type="number"
                  name={id}
                  validate={id === feeFineBalanceId ? feeFineLimitsValidation : limitsValidation}
                />
              </Col>
            </Row>
          </div>
        );
      })
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
      patronGroup,
      handleSubmit,
    } = this.props;

    return (
      <form
        data-test-limits-form
        className={css.partonBlockForm}
        onSubmit={handleSubmit}
      >
        <Pane
          defaultWidth="fill"
          fluidContentWidth
          paneTitle={patronGroup}
          footer={this.renderFooter()}
        >
          {this.renderConditions()}
        </Pane>
      </form>
    );
  }
}

export default stripesFinalForm({
  navigationCheck: true,
  validateOnBlur: true,
  validate: limitsValidation,
})(LimitsForm);
