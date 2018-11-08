import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { validate } from '../util';

class RefundReasonsSettings extends React.Component {
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
    const label = <FormattedMessage id="ui-users.refunds.singular" />;

    return (
      <this.connectedControlledVocab
        {...this.props}
        validate={(item, index, items) => validate(item, index, items, 'nameReason', label)}
        baseUrl="refunds"
        records="refunds"
        label={<FormattedMessage id="ui-users.refunds.label" />}
        labelSingular={label}
        objectLabel=""
        visibleFields={['nameReason', 'description']}
        columnMapping={{
          nameReason: <FormattedMessage id="ui-users.refunds.columns.nameReason" />,
          description: <FormattedMessage id="ui-users.refunds.columns.description" />,
        }}
        nameKey="refund"
        hiddenFields={['numberOfObjects']}
        id="refunds"
        sortby="nameReason"
      />
    );
  }
}

export default RefundReasonsSettings;
