import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import setFieldData from 'final-form-set-field-data';

import stripesFinalForm from '@folio/stripes/final-form';
import {
  Modal,
  Button,
  TextArea,
  Checkbox,
  Row,
  Col,
} from '@folio/stripes/components';

import css from './modal.css';

class CancellationModal extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    open: PropTypes.bool,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    account: PropTypes.object,
    onClose: PropTypes.func,
    reset: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
    owners: PropTypes.arrayOf(PropTypes.object),
    feefines: PropTypes.arrayOf(PropTypes.object),
  };

  onCloseModal = () => {
    const { onClose, form: { reset } } = this.props;
    onClose();
    reset();
  }

  validateComment = (value) => {
    let error;
    if (isEmpty(value)) {
      error = <FormattedMessage id="ui-users.accounts.cancellation.error.comment" />;
    }
    return error;
  };

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
      open,
      owners,
      pristine,
      submitting,
      handleSubmit,
      form: { getState },
    } = this.props;

    const {
      valid,
      values: {
        notify,
      }
    } = getState();

    let showNotify = false;
    const feefine = feefines.find(f => f.id === account.feeFineId) || {};
    const owner = owners.find(o => o.id === account.ownerId) || {};
    const submitButtonDisabled = pristine || submitting || !valid;

    if (feefine.actionNoticeId || owner.defaultActionNoticeId) {
      showNotify = true;
    }

    return (
      <Modal
        id="error-modal"
        label={<FormattedMessage id="ui-users.accounts.cancellation.field.confirmcancelled" />}
        open={open}
        onClose={this.onCloseModal}
        size="small"
        dismissible
      >
        <form onSubmit={handleSubmit}>
          <Row>
            <Col xs>
              <span>
                <FormattedMessage
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
              <FormattedMessage id="ui-users.accounts.commentStaff" />*
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Field
                name="comment"
                component={TextArea}
                validate={this.validateComment}
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
                    type="checkbox"
                    inline
                    label={<FormattedMessage id="ui-users.accounts.cancellation.field.notifyPatron" />}
                  />
                </Col>
              </Row>
            </div>
          }
          <br />
          {notify && showNotify &&
            <div>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.field.infoPatron" />
                </Col>
              </Row>
              <Row>
                <Col xs>
                  <Field
                    name="patronInfo"
                    component={TextArea}
                  />
                </Col>
              </Row>
              <br />
            </div>
          }
          <Row>
            <Col xs>
              <Button
                data-test-error-submit
                buttonStyle="primary"
                type="submit"
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

export default stripesFinalForm({
  subscription: { values: true },
  mutators: { setFieldData }
})(CancellationModal);
