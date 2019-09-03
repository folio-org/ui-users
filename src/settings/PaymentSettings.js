import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
} from 'react-intl';
import { Field } from 'redux-form';
import { Select } from '@folio/stripes/components';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { stripesConnect, withStripes } from '@folio/stripes/core';

import { validate } from '../components/util';
import { Owners } from './FeeFinesTable';

class PaymentSettings extends React.Component {
  static manifest = Object.freeze({
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?query=cql.allRecords=1 sortby owner&limit=500',
      accumulate: 'true',
    }
  });

  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      ownerId: '',
      owners: [],
    };

    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
    this.onChangeOwner = this.onChangeOwner.bind(this);
  }

  componentDidMount() {
    this.props.mutator.owners.reset();
    this.props.mutator.owners.GET().then(records => {
      const ownerId = (records.length > 0) ? records[0].id : '';
      this.setState({ owners: records, ownerId });
    });
  }

  onChangeOwner(e) {
    const ownerId = e.target.value;
    this.setState({ ownerId });
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const {
      ownerId,
      owners
    } = this.state;
    const label = formatMessage({ id: 'ui-users.payments.singular' });

    const fieldComponents = {
      'allowedRefundMethod': ({ fieldProps }) => (
        <Field
          {...fieldProps}
          component={Select}
          dataOptions={[{ label: formatMessage({ id: 'ui-users.feefines.modal.yes' }), value: true }, { label: formatMessage({ id: 'ui-users.feefines.modal.no' }), value: false }]}
          marginBottom0
        />
      )
    };

    const formatter = {
      'allowedRefundMethod': (item) => ((item.allowedRefundMethod)
        ? formatMessage({ id: 'ui-users.feefines.modal.yes' })
        : formatMessage({ id: 'ui-users.feefines.modal.no' })),
    };

    const preCreateHook = (item) => {
      item.ownerId = ownerId;
      return item;
    };

    return (
      <this.connectedControlledVocab
        {...this.props}
        baseUrl="payments"
        columnMapping={{
          nameMethod: formatMessage({ id: 'ui-users.payments.columns.name' }),
          allowedRefundMethod: formatMessage({ id: 'ui-users.payments.columns.refund' }),
        }}
        fieldComponents={fieldComponents}
        formatter={formatter}
        hiddenFields={['numberOfObjects']}
        id="settings-payments"
        itemTemplate={{ allowedRefundMethod: true }}
        label={formatMessage({ id: 'ui-users.payments.label' })}
        labelSingular={label}
        nameKey="payment"
        objectLabel=""
        preCreateHook={preCreateHook}
        records="payments"
        rowFilter={<Owners dataOptions={owners} onChange={this.onChangeOwner} />}
        rowFilterFunction={(item) => (item.ownerId === ownerId)}
        sortby="nameMethod"
        validate={(item, index, items) => validate(item, index, items, 'nameMethod', label)}
        visibleFields={['nameMethod', 'allowedRefundMethod']}
      />
    );
  }
}

export default injectIntl(withStripes(stripesConnect(PaymentSettings)));
