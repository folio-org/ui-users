import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Button from '@folio/stripes-components/lib/Button';
import TextArea from '@folio/stripes-components/lib/TextArea';
import Modal from '@folio/stripes-components/lib/Modal';
import { FormattedMessage } from 'react-intl';

const validate = (values) => {
  const errors = {};
  if (!values.comment) {
    errors.comment = 'Enter a comment';
  }
  return errors;
};

const CommentModal = props => (
  <Modal
    open={props.open}
    label="Fee/fine comment"
    onClose={props.onClose}
    size="small"
    dismissible
  >
    <form>
      <Row><Col xs><FormattedMessage id="ui-users.accounts.comment.field.comment" /></Col></Row>
      <br />
      <Row>
        <Col xs>
          <Field
            name="comment"
            component={TextArea}
            placeholder="Enter a comment"
          />
        </Col>
      </Row>
      <Row>
        <Col xs>
          <Button style={{ float: 'right', marginRight: '10px' }} buttonStyle="primary" onClick={() => { props.handleSubmit(); props.reset(); }} disabled={props.pristine || props.submitting || props.invalid}><FormattedMessage id="ui-users.accounts.comment.field.save" /></Button>
          <Button style={{ float: 'right', marginRight: '10px' }} onClick={(e) => { props.onClose(e); props.reset(); }}><FormattedMessage id="ui-users.accounts.comment.field.cancel" /></Button>
        </Col>
      </Row>
    </form>
  </Modal>
);

CommentModal.propTypes = {
  open: PropTypes.bool,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  onClose: PropTypes.func,
  handleSubmit: PropTypes.func,
  reset: PropTypes.func,
};

export default reduxForm({
  form: 'comment',
  validate,
  fields: [],
})(CommentModal);
