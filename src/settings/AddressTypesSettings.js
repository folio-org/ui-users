import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { stripesConnect, TitleManager } from '@folio/stripes/core';

class AddressTypesSettings extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);
  }

  render() {
    const {
      stripes,
      intl,
    } = this.props;

    const hasEditPerm = stripes.hasPerm('addresstypes.item.put');
    const hasDeletePerm = stripes.hasPerm('addresstypes.item.delete');
    const hasCreatePerm = stripes.hasPerm('addresstypes.item.post');

    return (
      <TitleManager
        record={intl.formatMessage({ id: 'ui-users.settings.addressTypes' })}
      >
        <this.connectedControlledVocab
          stripes={stripes}
          baseUrl="addresstypes"
          records="addressTypes"
          label={intl.formatMessage({ id: 'ui-users.contact.addressTypes' })}
          labelSingular={intl.formatMessage({ id: 'ui-users.contact.addressType' })}
          objectLabel={<FormattedMessage id="ui-users.contact.addresses" />}
          visibleFields={['addressType', 'desc']}
          columnMapping={{
            addressType: intl.formatMessage({ id: 'ui-users.contact.addressType' }),
            desc: intl.formatMessage({ id: 'ui-users.description' }),
          }}
          nameKey="addressType"
          id="addresstypes"
          sortby="addressType"
          canCreate={hasCreatePerm}
          actionSuppressor={{
            delete: _ => !hasDeletePerm,
            edit: _ => !hasEditPerm,
          }}
        />
      </TitleManager>
    );
  }
}

export default injectIntl(stripesConnect(AddressTypesSettings));
