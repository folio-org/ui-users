import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
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
    initialValues: PropTypes.shape({
      ownerId: PropTypes.string,
    }).isRequired,
    onChangeOwner: PropTypes.func.isRequired,
    ownerOptions: PropTypes.arrayOf(PropTypes.object),
    onChangeFeeFine: PropTypes.func,
    intl: PropTypes.object,
    isPending: PropTypes.object,
  };

  componentDidMount() {
    const {
      initialValues: {
        ownerId,
      },
      onChangeOwner,
    } = this.props;

    if (ownerId) {
      onChangeOwner(ownerId);
    }
  }

  onBlurAmount = (e) => {
    const { form: { change } } = this.props;

    change('amount', parseFloat(e.target.value || 0).toFixed(2));
  }

  render() {
    const {
      intl: { formatMessage },
      isPending,
      ownerOptions,
      feefineList,
      onChangeOwner,
      onChangeFeeFine,
    } = this.props;

    return (
      <section>
        <Row>
          <Col xs={12}>
            <Row>
              <Col xs={4}>
                <Row>
                  <Col xs={12}>
                    <Field
                      name="ownerId"
                      label={<FormattedMessage id="ui-users.charge.owner.label" />}
                      id="ownerId"
                      type="select"
                      component={Select}
                      fullWidth
                      required
                      aria-required="true"
                      disabled={isPending.owners}
                      dataOptions={ownerOptions}
                      onChange={(e) => onChangeOwner(e.target.value)}
                      placeholder={formatMessage({ id: 'ui-users.feefines.modal.placeholder' })}
                    />
                    {isPending.owners && <FormattedMessage id="ui-users.loading" />}
                  </Col>
                </Row>
              </Col>
              <Col xs={4}>
                <Row>
                  <Col xs={12}>
                    <Field
                      name="feeFineId"
                      label={<FormattedMessage id="ui-users.charge.feefine.label" />}
                      id="feeFineType"
                      type="select"
                      component={Select}
                      fullWidth
                      required
                      aria-required="true"
                      disabled={isPending.feefines}
                      dataOptions={feefineList}
                      placeholder={formatMessage({ id: 'ui-users.feefines.modal.placeholder' })}
                      onChange={onChangeFeeFine}
                    />
                    {isPending.feefines && <FormattedMessage id="ui-users.loading" />}
                  </Col>
                </Row>
              </Col>
              <Col xs={4}>
                <Row>
                  <Col xs={12}>
                    <Field
                      name="amount"
                      label={<FormattedMessage id="ui-users.charge.amount.label" />}
                      id="amount"
                      type="number"
                      component={TextField}
                      fullWidth
                      required
                      aria-required="true"
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

export default injectIntl(FeeFineInfo);
