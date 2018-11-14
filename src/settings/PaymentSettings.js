import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { Select } from '@folio/stripes/components';
import { Field } from 'redux-form';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { validate } from '../util';

class PaymentSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const {
      intl,
      stripes,
    } = this.props;

    const label = intl.formatMessage({ id: 'ui-users.payments.singular' });

    const fieldComponents = {
      'allowedRefundMethod': ({ fieldProps }) => (
        <Field
          {...fieldProps} // spread fieldProps to apply 'name' and 'aria-label' props.
          component={Select}
          marginBottom0
        >
          <FormattedMessage id="ui-users.feefines.modal.yes">
            {(message) => <option value="true">{message}</option>}
          </FormattedMessage>
          <FormattedMessage id="ui-users.feefines.modal.no">
            {(message) => <option value="false">{message}</option>}
          </FormattedMessage>
        </Field>
      )
    };

    const formatter = {
      'allowedRefundMethod': (payment) => ((payment.allowedRefundMethod)
        ? <FormattedMessage id="ui-users.feefines.modal.yes" />
        : <FormattedMessage id="ui-users.feefines.modal.no" />),
    };
    return (
      <this.connectedControlledVocab
        stripes={stripes}
        validate={(item, index, items) => validate(item, index, items, 'nameMethod', label)}
        fieldComponents={fieldComponents}
        formatter={formatter}
        baseUrl="payments"
        itemTemplate={{ allowedRefundMethod: true }}
        records="payments"
        label={intl.formatMessage({ id: 'ui-users.payments.label' })}
        labelSingular={label}
        objectLabel=""
        visibleFields={['nameMethod', 'allowedRefundMethod']}
        columnMapping={{
          'nameMethod': intl.formatMessage({ id: 'ui-users.payments.columns.name' }),
          'allowedRefundMethod': intl.formatMessage({ id: 'ui-users.payments.columns.refund' }),
        }}
        nameKey="paymentMethods"
        hiddenFields={['numberOfObjects']}
        id="payments"
        sortby="nameMethod"
      />
    );
  }
}

export default injectIntl(PaymentSettings);
