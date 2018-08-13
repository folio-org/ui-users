import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

class WaiveSettings extends React.Component {
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
        if ((index !== i) && ((obj.nameReason || '').localeCompare(item.nameReason, 'sv', { sensitivity: 'base' }) === 0)) {
          error.nameReason = <SafeHTMLMessage
            id="ui-users.duplicated"
            values={{ field: this.props.stripes.intl.formatMessage({ id: 'ui-users.waives.singular' }) }}
          />;
        }
      }
      return error;
    };
    return (
      <this.connectedControlledVocab
        {...this.props}
        validate={validate}
        baseUrl="waives"
        records="waives"
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.waives.label' })}
        labelSingular={this.props.stripes.intl.formatMessage({ id: 'ui-users.waives.singular' })}
        objectLabel=""
        visibleFields={['nameReason', 'description']}
        columnMapping={{
          'nameReason': this.props.stripes.intl.formatMessage({ id: 'ui-users.waives.columns.reason' }),
           'description': this.props.stripes.intl.formatMessage({ id: 'ui-users.waives.columns.desc' }),
        }}
        nameKey="waiveReasons"
        hiddenFields={['numberOfObjects']}
        id="waives"
      />
    );
  }
}

export default WaiveSettings;
