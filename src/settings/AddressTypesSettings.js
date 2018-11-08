import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';

class AddressTypesSettings extends React.Component {
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
    const { stripes } = this.props;
    return (
      <this.connectedControlledVocab
        stripes={stripes}
        baseUrl="addresstypes"
        records="addressTypes"
        label={<FormattedMessage id="ui-users.contact.addressTypes" />}
        labelSingular={<FormattedMessage id="ui-users.contact.addressType" />}
        objectLabel={<FormattedMessage id="ui-users.contact.addresses" />}
        visibleFields={['addressType', 'desc']}
        columnMapping={{
          addressType: <FormattedMessage id="ui-users.contact.addressType" />,
          desc: <FormattedMessage id="ui-users.description" />,
        }}
        nameKey="addressType"
        id="addresstypes"
        sortby="addressType"
      />
    );
  }
}

export default AddressTypesSettings;
