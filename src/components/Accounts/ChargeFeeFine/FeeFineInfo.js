import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';

import {
  Row,
  Col,
  TextField,
  Select,
} from '@folio/stripes/components';

class FeeFineInfo extends React.Component {
  static propTypes = {
    feefineList: PropTypes.arrayOf(PropTypes.object),
    form: PropTypes.object.isRequired,
    onChangeOwner: PropTypes.func,
    ownerOptions: PropTypes.arrayOf(PropTypes.object),
    onChangeFeeFine: PropTypes.func,
    isPending: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.amount = 0;
  }

  onChangeAmount(e) {
    this.amount = parseFloat(e.target.value || 0).toFixed(2);
    this.props.onChangeFeeFine(this.amount);
  }

  onBlurAmount = () => {
    const { form: { change } } = this.props;
    change('amount', this.amount);
  }

  render() {
    const {
      isPending,
      ownerOptions,
      feefineList,
      onChangeOwner,
      onChangeFeeFine,
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
                          type="select"
                          component={Select}
                          fullWidth
                          disabled={isPending.owners}
                          dataOptions={ownerOptions}
                          onChange={onChangeOwner}
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
                          id="feeFineType"
                          type="select"
                          component={Select}
                          fullWidth
                          disabled={isPending.feefines}
                          dataOptions={feefineList}
                          placeholder={placeholder}
                          onChange={onChangeFeeFine}
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
                      id="amount"
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
