import React from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
} from 'react-intl';
import { ControlledVocab } from '@folio/stripes/smart-components';
import { withStripes } from '@folio/stripes/core';
import { validate } from '../util';

class WaiveSettings extends React.Component {
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

    const label = intl.formatMessage({ id: 'ui-users.waives.singular' });

    return (
      <this.connectedControlledVocab
        stripes={stripes}
        validate={(item, index, items) => validate(item, index, items, 'nameReason', label)}
        baseUrl="waives"
        records="waivers"
        label={intl.formatMessage({ id: 'ui-users.waives.label' })}
        labelSingular={label}
        objectLabel=""
        visibleFields={['nameReason', 'description']}
        columnMapping={{
          'nameReason': intl.formatMessage({ id: 'ui-users.waives.columns.reason' }),
          'description': intl.formatMessage({ id: 'ui-users.waives.columns.desc' }),
        }}
        nameKey="waiveReasons"
        hiddenFields={['numberOfObjects']}
        id="settings-waives"
        sortby="nameReason"
      />
    );
  }
}

export default injectIntl(withStripes(WaiveSettings));
