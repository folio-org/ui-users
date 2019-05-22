import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Field,
  reduxForm,
} from 'redux-form';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Modal,
  Button,
  TextArea,
  Checkbox,
  Row,
  Col,
} from '@folio/stripes/components';

import css from './modal.css';

const validate = (values) => {
  const errors = {};
  if (!values.comment) {
    errors.comment = 'Comment must be provided';
  }
  return errors;
};

class CancellationModal extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    account: PropTypes.object,
    onClose: PropTypes.func,
    reset: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      notify: true,
    };
  }

  reset = () => {
    this.props.reset();
    this.setState({
      notify: true,
    });
  }

  handleNotify = () => {
    const { notify } = this.state;

    this.setState({
      notify: !notify,
    });
  }

  handleSubmit = () => {
    this.props.handleSubmit();
    this.reset();
  }

  onClose = () => {
    this.props.onClose();
    this.reset();
  }

  render() {
    const defaultAmount = '0.00';
    const defaultFeeFineType = 'fee/fine type';
    const {
      account: {
        amount = defaultAmount,
        feeFineType = defaultFeeFineType,
      },
      pristine,
      submitting,
      invalid,
      open,
    } = this.props;

    const submitButtonDisabled = pristine || submitting || invalid;

    return (
      <Modal
        id="error-modal"
        label={<FormattedMessage id="ui-users.accounts.cancellation.field.confirmcancelled" />}
        open={open}
        onClose={this.onClose}
        size="small"
        dismissible
      >
        <form>
          <Row>
            <Col xs>
              <span>
                <SafeHTMLMessage
                  id="ui-users.accounts.cancellation.feeFinewillBeCancelled"
                  values={{
                    amount: parseFloat(amount).toFixed(2),
                    feeFineType
                  }}
                />
              </span>
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.cancellation.field.reason" />
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.cancellation.field.cancellationInfo">
                {placeholder => (
                  <Field
                    name="comment"
                    component={TextArea}
                    placeholder={placeholder}
                  />
                )}
              </FormattedMessage>
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Field
                name="notify"
                component={Checkbox}
                onChange={this.handleNotify}
                checked={this.state.notify}
                inline
              />
              <FormattedMessage id="ui-users.accounts.cancellation.field.notifyPatron" />
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <Button
                buttonStyle="primary"
                onClick={this.handleSubmit}
                disabled={submitButtonDisabled}
                buttonClass={css.rightAlignedButton}
              >
                <FormattedMessage id="ui-users.accounts.cancellation.field.confirm" />
              </Button>
              <Button
                onClick={this.onClose}
                buttonClass={css.rightAlignedButton}
              >
                <FormattedMessage id="ui-users.accounts.cancellation.field.back" />
              </Button>
            </Col>
          </Row>
        </form>
      </Modal>
    );
  }
}

export default reduxForm({
  form: 'cancellation',
  validate,
  fields: [],
})(CancellationModal);
