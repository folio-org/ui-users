import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';

class RefundReasonsSettings extends React.Component {
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
            values={{ field: this.props.stripes.intl.formatMessage({ id: 'ui-users.refunds.singular' }) }}
          />;
        }
      }
      return error;
    };

    return (
      <this.connectedControlledVocab
        {...this.props}
        validate={validate}
        baseUrl="refunds"
        records="refunds"
        label={this.props.stripes.intl.formatMessage({ id: 'ui-users.refunds.label' })}
        labelSingular={this.props.stripes.intl.formatMessage({ id: 'ui-users.refunds.singular' })}
        objectLabel=""
        visibleFields={['nameReason', 'description']}
        columnMapping={{
          nameReason: this.props.stripes.intl.formatMessage({ id: 'ui-users.refunds.columns.nameReason' }),
          description: this.props.stripes.intl.formatMessage({ id: 'ui-users.refunds.columns.description' }),
        }}
        nameKey="refund"
        hiddenFields={['numberOfObjects']}
        id="refunds"
      />
    );
  }
}

export default RefundReasonsSettings;
