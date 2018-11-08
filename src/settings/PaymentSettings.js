import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Select } from '@folio/stripes/components';
import { Field } from 'redux-form';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { validate } from '../util';

class PaymentSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const label = <FormattedMessage id="ui-users.payments.singular" />;

    const fieldComponents = {
      'allowedRefundMethod': ({ fieldProps }) => (
        <Field
          {...fieldProps} // spread fieldProps to apply 'name' and 'aria-label' props.
          component={Select}
          marginBottom0
          dataOptions={[
            { label: <FormattedMessage id="ui-users.feefines.modal.yes" value="true" /> },
            { label: <FormattedMessage id="ui-users.feefines.modal.no" value="false" /> },
          ]}
        />
      )
    };

    const formatter = {
      'allowedRefundMethod': (payment) => ((payment.allowedRefundMethod)
        ? <FormattedMessage id="ui-users.feefines.modal.yes" />
        : <FormattedMessage id="ui-users.feefines.modal.no" />),
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
        label={<FormattedMessage id="ui-users.payments.label" />}
        labelSingular={label}
        objectLabel=""
        visibleFields={['nameMethod', 'allowedRefundMethod']}
        columnMapping={{
          'nameMethod': <FormattedMessage id="ui-users.payments.columns.name" />,
          'allowedRefundMethod': <FormattedMessage id="ui-users.payments.columns.refund" />,
        }}
        nameKey="paymentMethods"
        hiddenFields={['numberOfObjects']}
        id="payments"
        sortby="nameMethod"
      />
    );
  }
}

export default PaymentSettings;
