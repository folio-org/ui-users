import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field, change } from 'redux-form';
import {
  Row,
  Col,
  TextField,
  Select,
} from '@folio/stripes/components';

class FeeFineInfo extends React.Component {
  static propTypes = {
    feefineList: PropTypes.arrayOf(PropTypes.object),
    onChangeOwner: PropTypes.func,
    owners: PropTypes.arrayOf(PropTypes.object),
    onChangeFeeFine: PropTypes.func,
    feefines: PropTypes.arrayOf(PropTypes.object),
    isPending: PropTypes.object,
    initialValues: PropTypes.object,
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.onChangeFeeFine = this.onChangeFeeFine.bind(this);
    this.amount = 0;
  }

  onChangeAmount(e) {
    this.amount = parseFloat(e.target.value || 0).toFixed(2);
    this.props.onChangeFeeFine(this.amount || 0);
  }

  onChangeFeeFine(e) {
    const feeFineId = e.target.value;
    const feefine = this.props.feefines.find(f => f.id === feeFineId) || {};
    this.amount = feefine.defaultAmount || 0;
    this.amount = parseFloat(this.amount).toFixed(2);
    this.props.onChangeFeeFine(parseFloat(feefine.defaultAmount || 0).toFixed(2), feeFineId);
  }

  onBlurAmount = (e) => {
    const { dispatch } = this.props;
    const amount = parseFloat(e.target.value || 0).toFixed(2);
    e.preventDefault();
    dispatch(change('chargefeefine', 'amount', amount));
  }

  render() {
    const {
      initialValues,
      isPending
    } = this.props;

    return (
      <section>
        <Row>
          <Col xs={12} sm={10} md={7} lg={5}>
            <Row>
              <Col xs={4}>
                <Row>
                  <Col xs={12}>
                    <b><FormattedMessage id="ui-users.charge.owner.label" /></b>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <FormattedMessage id="ui-users.feefines.modal.placeholder">
                      {placeholder => (
                        <Field
                          name="ownerId"
                          id="ownerId"
                          component={Select}
                          fullWidth
                          value={initialValues.ownerId}
                          disabled={this.props.isPending.owners}
                          dataOptions={this.props.owners}
                          onChange={this.props.onChangeOwner}
                          placeholder={placeholder}
                        />
                      )}
                    </FormattedMessage>
                    {isPending.owners && <FormattedMessage id="ui-users.loading" />}
                  </Col>
                </Row>
              </Col>
              <Col xs={4}>
                <Row>
                  <Col xs={12}>
                    <b><FormattedMessage id="ui-users.charge.feefine.label" /></b>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <FormattedMessage id="ui-users.feefines.modal.placeholder">
                      {placeholder => (
                        <Field
                          name="feeFineId"
                          component={Select}
                          fullWidth
                          disabled={this.props.isPending.feefines}
                          dataOptions={this.props.feefineList}
                          placeholder={placeholder}
                          onChange={this.onChangeFeeFine}
                        />
                      )}
                    </FormattedMessage>
                    {isPending.feefines && <FormattedMessage id="ui-users.loading" />}
                  </Col>
                </Row>
              </Col>
              <Col xs={4}>
                <Row>
                  <Col xs={12}>
                    <b><FormattedMessage id="ui-users.charge.amount.label" /></b>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Field
                      name="amount"
                      component={TextField}
                      fullWidth
                      required
                      onChange={this.onChangeAmount}
                      onBlur={this.onBlurAmount}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </section>
    );
  }
}

export default FeeFineInfo;
