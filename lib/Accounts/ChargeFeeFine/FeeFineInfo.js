import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Select from '@folio/stripes-components/lib/Select';
import TextField from '@folio/stripes-components/lib/TextField';

import { getTotal } from '../accountFunctions';

class FeeFineInfo extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.object,
    }),
    feefineList: PropTypes.arrayOf(PropTypes.object),
    onChangeOwner: PropTypes.func,
    owners: PropTypes.arrayOf(PropTypes.object),
    onChangeFeeFine: PropTypes.func,
    feefines: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.onChangeFeeFine = this.onChangeFeeFine.bind(this);
    this.onChangeTaxVat = this.onChangeTaxVat.bind(this);
    this.amount = 0;
    this.taxvat = 0;
    this.total = parseFloat(0).toFixed(2);
  }

  onChangeAmount(e) {
    this.amount = e.target.value;
    this.total = getTotal(e.target.value, this.taxvat);
    this.props.onChangeFeeFine(e.target.value, this.taxvat);
  }

  onChangeFeeFine(e) {
    const feeFineId = e.target.value.substring(0, 36);
    const feefine = this.props.feefines.find(f => f.id === feeFineId) || {};
    this.amount = feefine.defaultAmount || 0;
    this.taxvat = feefine.taxVat || 0;
    this.total = getTotal(feefine.defaultAmount, feefine.taxVat);
    this.props.onChangeFeeFine(feefine.defaultAmount, feefine.taxVat);
  }

  onChangeTaxVat(e) {
    this.taxvat = e.target.value;
    this.total = getTotal(this.amount, e.target.value);
    this.props.onChangeFeeFine(this.amount, e.target.value);
  }

  render() {
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
                    <Field
                      name="ownerId"
                      component={Select}
                      fullWidth
                      dataOptions={this.props.owners}
                      onChange={this.props.onChangeOwner}
                      placeholder={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.placeholder' })}
                    />
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
                    <Field
                      name="feeFineId"
                      component={Select}
                      fullWidth
                      dataOptions={this.props.feefineList}
                      placeholder={this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.placeholder' })}
                      onChange={this.onChangeFeeFine}
                    />
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
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <FormattedMessage id="ui-users.charge.taxVat.label" />
                  </Col>
                  <Col xs={6}>
                    <Field
                      name="taxVat"
                      component={TextField}
                      fullWidth
                      onChange={this.onChangeTaxVat}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={6}>
                    <b><FormattedMessage id="ui-users.charge.total" /></b>
                  </Col>
                  <Col xs={6}>
                    {this.total}
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
