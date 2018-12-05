import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Field,
  reduxForm,
  change,
} from 'redux-form';

import {
  Row,
  Col,
  Button,
  TextArea,
  Modal,
  TextField,
  Checkbox,
  Select,
} from '@folio/stripes/components';

const validate = (values, props) => {
  const accounts = props.accounts || [];
  let selected = 0;
  accounts.forEach(a => {
    selected += a.remaining;
  });

  const errors = {};
  if (!values.waive) {
    errors.waive = <FormattedMessage id="ui-users.accounts.error.field" />;
  }
  if (values.waive < 0) {
    errors.waive = <FormattedMessage id="ui-users.accounts.waive.error.amount" />;
  }
  if (!values.method) {
    errors.method = 'Select one';
  }
  if (props.commentRequired && !values.comment) {
    errors.comment = <FormattedMessage id="ui-users.accounts.error.comment" />;
  }
  if (values.waive > selected) {
    errors.waive = <FormattedMessage id="ui-users.accounts.waive.error.exceeds" />;
  }
  return errors;
};


class WaiveModal extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    handleSubmit: PropTypes.func,
    accounts: PropTypes.arrayOf(PropTypes.object),
    waives: PropTypes.arrayOf(PropTypes.object),
    balance: PropTypes.number,
    initialize: PropTypes.func,
    pristine: PropTypes.bool,
    invalid: PropTypes.bool,
    submitting: PropTypes.bool,
    reset: PropTypes.func,
    commentRequired: PropTypes.bool,
    dispatch: PropTypes.func,
  };


  constructor(props) {
    super(props);
    this.state = {
      waive: 0,
    };
    this.onChangeWaive = this.onChangeWaive.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const accounts = nextProps.accounts || [];
    let selected = 0;
    if (JSON.stringify(this.props.accounts) !== JSON.stringify(nextProps.accounts)) {
      selected = 0;
      accounts.forEach(a => {
        selected += a.remaining;
      });
      this.setState({
        waive: selected,
      });
      this.props.initialize({ waive: parseFloat(selected).toFixed(2), notify: true });
    }
    return (
      this.props.accounts !== nextProps.accounts
      || this.state !== nextState
      || this.props.open !== nextProps.open
      || this.props.pristine !== nextProps.pristine
      || this.props.invalid !== nextProps.invalid
    );
  }

  onChangeWaive(e) {
    if (e.target.value === '') {
      this.setState({ waive: 0.00 });
    } else {
      this.setState({ waive: parseFloat(e.target.value) });
    }
  }

  calculateSelectedAmount() {
    const { accounts } = this.props;
    const result = accounts.reduce((selected, { remaining }) => {
      return selected + parseFloat(remaining);
    }, 0);
    return result;
  }

  renderFormMessage() {
    const {
      accounts = []
    } = this.props;

    const selected = this.calculateSelectedAmount();
    const waiveAmount = this.state.waive === ''
      ? 0.00
      : this.state.waive;

    const waiveType = this.state.waive < selected
      ? <FormattedMessage id="ui-users.accounts.waive.summary.partiallyWaive" />
      : <FormattedMessage id="ui-users.accounts.waive.summary.waiving" />;

    const feeFineForm = accounts.length === 1
      ? <FormattedMessage id="ui-users.accounts.feeFine" />
      : <FormattedMessage id="ui-users.accounts.feesFines" />;

    return (
      <FormattedMessage
        id="ui-users.accounts.waive.summary"
        values={{
          feesFinesAmount: accounts.length,
          waiveAmount: parseFloat(waiveAmount).toFixed(2),
          waiveType,
          feeFineForm
        }}
      />
    );
  }

  onCancel = () => {
    this.props.onClose();
    this.props.reset();
  };

  onSubmit = () => {
    this.props.handleSubmit();
    this.props.reset();
  };

  render() {
    const {
      commentRequired,
      waives,
      submitting,
      invalid,
      pristine,
      balance: totalAmount
    } = this.props;

    const selected = this.calculateSelectedAmount();
    const remaining = totalAmount - this.state.waive;
    const reasonSelectOptions = waives.map(p => ({ id: p.id, label: p.nameReason }));
    const message = this.renderFormMessage();
    const placeholderTranslationId = commentRequired
      ? 'ui-users.accounts.waive.placeholder.additional.required'
      : 'ui-users.accounts.waive.placeholder.additional.optional';

    const submitButtonDisabled = pristine || submitting || invalid;

    return (
      <Modal
        open={this.props.open}
        label={<FormattedMessage id="ui-users.accounts.waive.modalLabel" />}
        onClose={this.props.onClose}
        size="medium"
        dismissible
      >
        <form>
          <Row>
            <Col xs>{message}</Col>
          </Row>
          <br />
          <Row>
            <Col xs={4.5}>
              <Row>
                <Col xs={7}><FormattedMessage id="ui-users.accounts.waive.field.totalowed" /></Col>
                <Col xs={4}>{parseFloat(totalAmount).toFixed(2)}</Col>
              </Row>
              <Row>
                <Col xs={7}><FormattedMessage id="ui-users.accounts.waive.field.selectedamount" /></Col>
                <Col xs={4}>{selected.toFixed(2)}</Col>
              </Row>
              <Row>
                <Col xs={7}>
                  <b><FormattedMessage id="ui-users.accounts.waive.field.waiveamount" /></b>
                  :
                </Col>
                <Col xs={4.5}>
                  <Field
                    name="waive"
                    component={TextField}
                    onChange={this.onChangeWaive}
                    onBlur={(e, value, next) => {
                      this.props.dispatch(change('waive', 'waive', parseFloat(next).toFixed(2)));
                    }}
                    fullWidth
                    autoFocus
                    required
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={7}>
                  <FormattedMessage id="ui-users.accounts.waive.field.remainingamount" />
                </Col>
                <Col xs={4}>{remaining.toFixed(2)}</Col>
              </Row>
            </Col>
            <Col xs={7}>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.waive.field.waivereason" />
                </Col>
              </Row>
              <Row>
                <Col xs>
                  <FormattedMessage id="ui-users.accounts.waive.placeholder.selectReason">
                    {placeholder => (
                      <Field
                        name="method"
                        component={Select}
                        dataOptions={reasonSelectOptions}
                        placeholder={placeholder}
                      />
                    )}
                  </FormattedMessage>
                </Col>
              </Row>
            </Col>
          </Row>
          <br />
          <br />
          <Row>
            <Col xs>
              <FormattedMessage id="ui-users.accounts.waive.field.comment" />
              {(this.props.commentRequired) ? '*' : ''}
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs>
              <FormattedMessage id={placeholderTranslationId}>
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
                inline
              />
              <FormattedMessage id="ui-users.accounts.waive.field.notifyPatron" />
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Button
                onClick={this.onCancel}
              >
                <FormattedMessage id="ui-users.accounts.waive.field.cancel" />
              </Button>
              <Button
                buttonStyle="primary"
                onClick={this.onSubmit}
                disabled={submitButtonDisabled}
              >
                <FormattedMessage id="ui-users.accounts.waive.field.waive" />
              </Button>
            </Col>
          </Row>
        </form>
      </Modal>
    );
  }
}

export default reduxForm({
  form: 'waive',
  fields: [],
  validate,
})(WaiveModal);
