import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import stripesFinalForm from '@folio/stripes/final-form';
import {
  Row,
  Col,
  Button,
  TextArea,
  Modal,
} from '@folio/stripes/components';

import css from './modal.css';

class CommentModal extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
  };

  onSubmit = () => {
    const {
      handleSubmit,
    } = this.props;

    handleSubmit();
  }

  handleClose = () => {
    const {
      onClose,
    } = this.props;

    onClose();
  }

  render() {
    const {
      pristine,
      submitting,
      invalid,
      open,
      onClose,
    } = this.props;

    const submitButtonDisabled = pristine || submitting || invalid;

    return (
      <Modal
        open={open}
        label={<FormattedMessage id="ui-users.accounts.comment.field.feeFineComment" />}
        onClose={onClose}
        size="small"
        dismissible
      >
        <form onSubmit={this.onSubmit}>
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.comment.field.comment" />
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
          <Row>
            <Col xs>
              <Button
                buttonStyle="primary"
                onClick={this.onSubmit}
                disabled={submitButtonDisabled}
                buttonClass={css.rightAlignedButton}
              >
                <FormattedMessage id="ui-users.accounts.comment.field.save" />
              </Button>
              <Button
                onClick={this.handleClose}
                buttonClass={css.rightAlignedButton}
              >
                <FormattedMessage id="ui-users.accounts.comment.field.cancel" />
              </Button>
            </Col>
          </Row>
        </form>
      </Modal>
    );
  }
}

export default stripesFinalForm({
  destroyOnUnregister: true,
  navigationCheck: true,
  subscription: { values: true },
})(CommentModal);
