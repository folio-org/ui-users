import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';
import { validate } from '../util';

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
    const label = this.props.stripes.intl.formatMessage({ id: 'ui-users.refunds.singular' });

    return (
      <this.connectedControlledVocab
        {...this.props}
        validate={(item, index, items) => validate(item, index, items, 'nameReason', label)}
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
