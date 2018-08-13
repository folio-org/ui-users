import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

class OwnerSettings extends React.Component {
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
    const validate = (item, index, items) => {
      const error = {};
      for (let i = 0; i < items.length; i++) {
        const obj = items[i];
        if ((index !== i) && ((obj.owner || '').localeCompare(item.owner, 'sv', { sensitivity: 'base' }) === 0)) {
          error.owner = <SafeHTMLMessage
            id="ui-users.duplicated"
            values={{ field: this.props.stripes.intl.formatMessage({ id: 'ui-users.owners.singular' }) }}
          />;
        }
      }
      return error;
    };

    return (
      <this.connectedControlledVocab
        {...this.props}
        validate={validate}
        baseUrl="owners"
        records="owners"
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.owners.label' })}
        labelSingular={this.props.stripes.intl.formatMessage({ id: 'ui-users.owners.singular' })}
        objectLabel=""
        hiddenFields={['numberOfObjects']}
        visibleFields={['owner', 'desc']}
        columnMapping={{
          owner: this.props.stripes.intl.formatMessage({ id: 'ui-users.owners.columns.owner' }),
          desc: this.props.stripes.intl.formatMessage({ id: 'ui-users.owners.columns.desc' })
        }}
        nameKey="ownerType"
        id="ownerstypes"
      />
    );
  }
}

export default OwnerSettings;
