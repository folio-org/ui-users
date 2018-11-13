import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, change } from 'redux-form';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
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
    intl: intlShape.isRequired,
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
    return (this.props.accounts !== nextProps.accounts
     || this.state !== nextState ||
     this.props.open !== nextProps.open ||
     this.props.pristine !== nextProps.pristine ||
     this.props.invalid !== nextProps.invalid);
  }

  onChangeWaive(e) {
    this.setState({ waive: e.target.value });
  }

  render() {
    const accounts = this.props.accounts || [];
    const n = accounts.length || 0;
    const totalamount = this.props.balance;
    let selected = parseFloat(0);
    accounts.forEach(a => {
      selected += parseFloat(a.remaining);
    });
    selected = parseFloat(selected).toFixed(2);
    const remaining = parseFloat(totalamount - this.state.waive).toFixed(2);
    const waives = this.props.waives.map(p => ({ id: p.id, label: p.nameReason }));
    const { submitting, invalid, pristine } = this.props;
    const waiveAmount = this.state.waive === '' ? 0.00 : this.state.waive;
    const message = `${(this.state.waive < selected) ? 'Partially waive' : 'Waiving'} ${n} ${(n === 1) ? 'fee/fine' : 'fees/fines'}    for a total amount of ${parseFloat(waiveAmount).toFixed(2)}`;
    const comment = (this.props.commentRequired)
      ? this.props.intl.formatMessage({ id: 'ui-users.accounts.waive.placeholder.additional.required' })
      : this.props.intl.formatMessage({ id: 'ui-users.accounts.waive.placeholder.additional.optional' });
    return (
      <Modal
        open={this.props.open}
        label="Waive Fee/Fine"
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
                <Col xs={4}>{parseFloat(totalamount).toFixed(2)}</Col>
              </Row>
              <Row>
                <Col xs={7}><FormattedMessage id="ui-users.accounts.waive.field.selectedamount" /></Col>
                <Col xs={4}>{parseFloat(selected).toFixed(2)}</Col>
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
                <Col xs={7}><FormattedMessage id="ui-users.accounts.waive.field.remainingamount" /></Col>
                <Col xs={4}>{remaining}</Col>
              </Row>
            </Col>
            <Col xs={7}>
              <Row><Col xs><FormattedMessage id="ui-users.accounts.waive.field.waivereason" /></Col></Row>
              <Row>
                <Col xs>
                  <Field
                    name="method"
                    component={Select}
                    dataOptions={waives}
                    placeholder="Select reason"
                  />
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
              <Field
                name="comment"
                component={TextArea}
                placeholder={comment}
              />
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Field
                name="notify"
                component={Checkbox}
                inline
              />
              {' Notify patron'}
            </Col>
          </Row>
          <Row>
            <Col xs>
              <Button onClick={() => { this.props.onClose(); this.props.reset(); }}><FormattedMessage id="ui-users.accounts.waive.field.cancel" /></Button>
              <Button buttonStyle="primary" onClick={() => { this.props.handleSubmit(); this.props.reset(); }} disabled={pristine || submitting || invalid}><FormattedMessage id="ui-users.accounts.waive.field.waive" /></Button>
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
})(injectIntl(WaiveModal));
