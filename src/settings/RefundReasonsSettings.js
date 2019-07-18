import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
} from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { withStripes } from '@folio/stripes/core';
import { validate } from '../util';

class RefundReasonsSettings extends React.Component {
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
    const { intl } = this.props;
    const label = intl.formatMessage({ id: 'ui-users.refunds.singular' });

    return (
      <this.connectedControlledVocab
        {...this.props}
        validate={(item, index, items) => validate(item, index, items, 'nameReason', label)}
        baseUrl="refunds"
        records="refunds"
        label={intl.formatMessage({ id: 'ui-users.refunds.label' })}
        labelSingular={label}
        objectLabel=""
        visibleFields={['nameReason', 'description']}
        columnMapping={{
          nameReason: intl.formatMessage({ id: 'ui-users.refunds.columns.nameReason' }),
          description: intl.formatMessage({ id: 'ui-users.refunds.columns.description' }),
        }}
        nameKey="refund"
        hiddenFields={['numberOfObjects']}
        id="settings-refunds"
        sortby="nameReason"
      />
    );
  }
}

export default injectIntl(withStripes(RefundReasonsSettings));
