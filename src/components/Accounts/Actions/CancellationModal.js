import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Field,
  reduxForm
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
    errors.comment = <FormattedMessage id="ui-users.accounts.cancellation.error.comment" />;
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
    owners: PropTypes.arrayOf(PropTypes.object),
    feefines: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);
    this.state = { notify: true };
  }

  reset = () => {
    this.props.reset();
    this.setState({ notify: true });
  }

  onToggleNotify = () => {
    this.setState(prevState => ({
      notify: !prevState.notify,
    }));
  }

  handleSubmit = (values) => {
    const { handleSubmit } = this.props;
    handleSubmit(values);
    this.reset();
  }

  onCloseModal = () => {
    const { onClose } = this.props;
    onClose();
    this.reset();
    this.setState({ notify: true });
  }

  render() {
    const defaultAmount = '0.00';
    const defaultFeeFineType = 'fee/fine type';
    const {
      account,
      account: {
        amount = defaultAmount,
        feeFineType = defaultFeeFineType,
      },
      feefines,
      invalid,
      open,
      owners,
      pristine,
      submitting
    } = this.props;

    let showNotify = false;

    const feefine = feefines.find(f => f.id === account.feeFineId) || {};
    const owner = owners.find(o => o.id === account.ownerId) || {};

    if (feefine.actionNoticeId || owner.defaultActionNoticeId) {
      showNotify = true;
    }

    const submitButtonDisabled = pristine || submitting || invalid;

    return (
      <Modal
        id="error-modal"
        label={<FormattedMessage id="ui-users.accounts.cancellation.field.confirmcancelled" />}
        open={open}
        onClose={this.onCloseModal}
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
              <Field
                name="comment"
                component={TextArea}
              />
            </Col>
          </Row>
          {showNotify &&
            <div>
              <Row>
                <Col xs>
                  <Field
                    name="notify"
                    component={Checkbox}
                    checked={this.state.notify}
                    onChange={this.onToggleNotify}
                    inline
                  />
                  <FormattedMessage id="ui-users.accounts.cancellation.field.notifyPatron" />
                </Col>
              </Row>
            </div>
          }
          <br />
          {(this.state.notify && showNotify) &&
            <div>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.field.infoPatron" />
                </Col>
              </Row>
              <br />
              <Row>
                <Col xs>
                  <Field
                    name="patronInfo"
                    component={TextArea}
                  />
                </Col>
              </Row>
            </div>
          }
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
                onClick={this.onCloseModal}
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
  enableReinitialize: true,
})(CancellationModal);
