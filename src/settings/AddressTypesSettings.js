import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';

class AddressTypesSettings extends React.Component {
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
      stripes,
      intl,
    } = this.props;

    return (
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
      />
    );
  }
}

export default injectIntl(AddressTypesSettings);
