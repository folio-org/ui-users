import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Field,
  reduxForm,
} from 'redux-form';

import {
  Row,
  Col,
  Button,
  TextArea,
  Modal,
} from '@folio/stripes/components';

const validate = (values) => {
  const errors = {};
  if (!values.comment) {
    errors.comment = 'Enter a comment';
  }
  return errors;
};

class CommentModal extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    invalid: PropTypes.bool,
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
    reset: PropTypes.func,
  };

  onSubmit = () => {
    this.props.handleSubmit();
    this.props.reset();
  }

  handleClose = () => {
    this.props.onClose();
    this.props.reset();
  }

  render() {
    const {
      pristine,
      submitting,
      invalid,
      open,
      onClose
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
        <form>
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.comment.field.comment" />
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.comment.field.enterComment">
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
              <Button
                style={{
                  float: 'right',
                  marginRight: '10px'
                }}
                buttonStyle="primary"
                onClick={this.onSubmit}
                disabled={submitButtonDisabled}
              >
                <FormattedMessage id="ui-users.accounts.comment.field.save" />
              </Button>
              <Button
                style={{
                  float: 'right',
                  marginRight: '10px'
                }}
                onClick={this.handleClose}
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

export default reduxForm({
  form: 'comment',
  validate,
  fields: [],
})(CommentModal);
