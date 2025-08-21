import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  FormattedMessage,
} from 'react-intl';

import {
  Label,
} from '@folio/stripes/components';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { stripesConnect, TitleManager } from '@folio/stripes/core';

import { validate } from '../components/util';
import { Owners } from './FeeFinesTable';

const columnMapping = {
  nameMethod: (
    <Label
      tagName="span"
      required
    >
      <FormattedMessage id="ui-users.payments.columns.name" />
    </Label>
  ),
  allowedRefundMethod: <FormattedMessage id="ui-users.payments.columns.refund" />,
};

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
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    intl: PropTypes.shape({}).isRequired,
    mutator: PropTypes.shape({
      owners: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
    }).isRequired,
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
    const { intl: { formatMessage }, stripes } = this.props;
    const {
      ownerId,
      owners
    } = this.state;
    const label = formatMessage({ id: 'ui-users.payments.singular' });
    const editable = stripes.hasPerm('ui-users.settings.payments.all');

    const preCreateHook = (item) => {
      item.ownerId = ownerId;
      return item;
    };

    return (
      <TitleManager
        record={formatMessage({ id: 'ui-users.settings.paymentMethods' })}
      >
        <this.connectedControlledVocab
          {...this.props}
          baseUrl="payments"
          columnMapping={columnMapping}
          hiddenFields={['numberOfObjects']}
          editable={editable}
          id="settings-payments"
          itemTemplate={{ allowedRefundMethod: false }}
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
          visibleFields={['nameMethod']}
          formType="final-form"
        />
      </TitleManager>
    );
  }
}

export default injectIntl(stripesConnect(PaymentSettings));
