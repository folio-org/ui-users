import React from 'react';
import PropTypes from 'prop-types';
import Select from '@folio/stripes-components/lib/Select';
import { Field } from 'redux-form';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';
import { validate } from '../util';

class PaymentSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const label = this.props.stripes.intl.formatMessage({ id: 'ui-users.payments.singular' });

    const fieldComponents = {
      'allowedRefundMethod': ({ fieldProps }) => (
        <Field
          {...fieldProps} // spread fieldProps to apply 'name' and 'aria-label' props.
          component={Select}
          marginBottom0
          dataOptions={[
            { label: this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.yes' }), value: true },
            { label: this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.no' }), value: false },
          ]}
        />
      )
    };

    const formatter = {
      'allowedRefundMethod': (payment) => ((payment.allowedRefundMethod)
        ? this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.yes' })
        : this.props.stripes.intl.formatMessage({ id: 'ui-users.feefines.modal.no' })),
    };
    return (
      <this.connectedControlledVocab
        {...this.props}
        validate={(item, index, items) => validate(item, index, items, 'nameMethod', label)}
        fieldComponents={fieldComponents}
        formatter={formatter}
        baseUrl="payments"
        itemTemplate={{ allowedRefundMethod: true }}
        records="payments"
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.payments.label' })}
        labelSingular={this.props.stripes.intl.formatMessage({ id: 'ui-users.payments.singular' })}
        objectLabel=""
        visibleFields={['nameMethod', 'allowedRefundMethod']}
        columnMapping={{
          'nameMethod': this.props.stripes.intl.formatMessage({ id: 'ui-users.payments.columns.name' }),
          'allowedRefundMethod': this.props.stripes.intl.formatMessage({ id: 'ui-users.payments.columns.refund' }),
        }}
        nameKey="paymentMethods"
        hiddenFields={['numberOfObjects']}
        id="payments"
      />
    );
  }
}

export default PaymentSettings;
