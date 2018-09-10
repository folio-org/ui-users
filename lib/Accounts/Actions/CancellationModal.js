import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import Modal from '@folio/stripes-components/lib/Modal';
import Button from '@folio/stripes-components/lib/Button';
import TextArea from '@folio/stripes-components/lib/TextArea';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

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
    this.handleNotify = this.handleNotify.bind(this);
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.props.reset();
    this.setState({
      notify: true,
    });
  }

  handleNotify() {
    const { notify } = this.state;
    this.setState({
      notify: !notify,
    });
  }

  render() {
    const { account, pristine, submitting, invalid } = this.props;
    const charged = account.amount || '0.00';
    const feeFineType = account.feeFineType || 'fee/fine type';

    return (
      <Modal
        label="Confirm fee/fine cancellation"
        open={this.props.open}
        onClose={() => { this.props.onClose(); this.reset(); }}
        size="small"
        dismissible
      >
        <form>
          <Row>
            <Col xs>
              <span><b>{parseFloat(charged).toFixed(2)}</b> {feeFineType} <FormattedMessage id="ui-users.accounts.cancellation.field.feefinewill" /> <b><FormattedMessage id="ui-users.accounts.cancellation.field.cancelled" /></b></span>
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs><FormattedMessage id="ui-users.accounts.cancellation.field.reason" /></Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <Field
                name="comment"
                component={TextArea}
                placeholder="Enter information about the cancellation (required)"
              />
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
              {' Notify patron'}
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <Button style={{ float: 'right', marginRight: '10px' }} buttonStyle="primary" onClick={() => { this.props.handleSubmit(); this.reset(); }} disabled={pristine || submitting || invalid}><FormattedMessage id="ui-users.accounts.cancellation.field.confirm" /></Button>
              <Button style={{ float: 'right', marginRight: '10px' }} onClick={(e) => { this.props.onClose(e); this.reset(); }}><FormattedMessage id="ui-users.accounts.cancellation.field.back" /></Button>
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

