import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';

import { ConfigManager } from '@folio/stripes/smart-components';
import {
  stripesShape,
  withStripes,
} from '@folio/stripes/core';

import ChargedOutConditionsForm from './ChargedOutConditionsForm';

class ChargedOutConditions extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    const {
      stripes,
      intl,
    } = props;

    this.configManager = stripes.connect(ConfigManager);
    this.formatMessage = intl.formatMessage;
  }

  getInitialValues(settings) {
    const defaultConfig = {
      blockBorrowing: false,
      blockRenewals: false,
      blockRequests: false,
      message: '',
    };

    return defaultConfig;
  }

  render() {
    return (
      <this.configManager
        label={<FormattedMessage id="ui-users.settings.items.charged" />}
        moduleName="USERS"
        configName="chargeOutConditions"
        configFormComponent={ChargedOutConditionsForm}
        getInitialValues={this.getInitialValues}
      />
    );
  }
}

export default injectIntl(withStripes(ChargedOutConditions));
