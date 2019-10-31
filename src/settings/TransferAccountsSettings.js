import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
} from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { stripesConnect, withStripes } from '@folio/stripes/core';
import { validate } from '../components/util';
import { Owners } from './FeeFinesTable';

class TransferAccountsSettings extends React.Component {
  static manifest = Object.freeze({
    owners: {
      type: 'okapi',
      records: 'owners',
      path: 'owners?query=cql.allRecords=1 sortby owner&limit=500',
      accumulate: 'true',
    },
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
    const label = formatMessage({ id: 'ui-users.transfers.singular' });

    const preCreateHook = (item) => {
      item.ownerId = ownerId;
      return item;
    };

    return (
      <this.connectedControlledVocab
        {...this.props}
        baseUrl="transfers"
        columnMapping={{
          accountName: formatMessage({ id: 'ui-users.transfers.columns.name' }) + '*',
          desc: formatMessage({ id: 'ui-users.transfers.columns.desc' })
        }}
        hiddenFields={['numberOfObjects']}
        id="settings-transfers"
        label={formatMessage({ id: 'ui-users.transfers.label' })}
        labelSingular={label}
        nameKey="transfer"
        objectLabel=""
        preCreateHook={preCreateHook}
        records="transfers"
        rowFilter={<Owners dataOptions={owners} onChange={this.onChangeOwner} />}
        rowFilterFunction={(item) => (item.ownerId === ownerId)}
        sortby="accountName"
        validate={(item, index, items) => validate(item, index, items, 'accountName', label)}
        visibleFields={['accountName', 'desc']}
      />
    );
  }
}

export default injectIntl(withStripes(stripesConnect(TransferAccountsSettings)));
