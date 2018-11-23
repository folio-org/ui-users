import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { Field } from 'redux-form';
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
    intl: intlShape.isRequired,
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
    const feeFineId = e.target.value.substring(0, 36);
    const feefine = this.props.feefines.find(f => f.id === feeFineId) || {};
    this.amount = feefine.defaultAmount || 0;
    this.amount = parseFloat(this.amount).toFixed(2);
    this.props.onChangeFeeFine(parseFloat(feefine.defaultAmount || 0).toFixed(2));
  }

  render() {
    const { intl } = this.props;

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
                      id="ownerId"
                      component={Select}
                      fullWidth
                      disabled={this.props.isPending.owners}
                      dataOptions={this.props.owners}
                      onChange={this.props.onChangeOwner}
                      placeholder={intl.formatMessage({ id: 'ui-users.feefines.modal.placeholder' })}
                    />
                    {(this.props.isPending.owners) ? 'Loading...' : ''}
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
                      disabled={this.props.isPending.feefines}
                      dataOptions={this.props.feefineList}
                      placeholder={intl.formatMessage({ id: 'ui-users.feefines.modal.placeholder' })}
                      onChange={this.onChangeFeeFine}
                    />
                    {(this.props.isPending.feefines) ? 'Loading...' : ''}
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
              </Col>
            </Row>
          </Col>
        </Row>
      </section>
    );
  }
}

export default injectIntl(FeeFineInfo);
