import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import {
  toNumber,
  map,
} from 'lodash';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
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

import {
  feeFineBalanceId,
  recallOverdueId,
} from '../../../constants';

import css from '../patronBlocks.css';

function validation(value, type) {
  const numberValue = toNumber(value);
  let min;
  let max;

  if (type === 'limits') {
    min = 1;
    max = 999999;
  }

  if (type === 'feefine') {
    min = 0.01;
    max = 999999.99;
  }

  if (type === 'overdue') {
    min = 0.01;
    max = 999999;
  }

  if (numberValue < min || numberValue > max) {
    return (
      <SafeHTMLMessage
        id="ui-users.settings.limits.validation.message"
        values={{ min, max }}
      />
    );
  }

  return null;
}

function limitsValidation(value) {
  return validation(value, 'limits');
}

function feeFineLimitsValidation(value) {
  return validation(value, 'feefine');
}

function overdueLimitsValidation(value) {
  return validation(value, 'overdue');
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
        let validate;

        if (id === feeFineBalanceId) {
          validate = feeFineLimitsValidation;
        } else if (id === recallOverdueId) {
          validate = overdueLimitsValidation;
        } else {
          validate = limitsValidation;
        }

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
                  validate={validate}
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
