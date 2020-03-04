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
  static manifest = Object.freeze({
    patronBlockConditionId: {},
    patronBlockConditions: {
      type: 'okapi',
      records: 'conditions',
      path: 'conditions',
      accumulate: 'true',
      PUT: {
        path: 'patron-block-conditions/{patronBlockConditionId}',
      },
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      patronBlockConditionId: PropTypes.shape({}),
      patronBlockConditions: PropTypes.shape({
        PUT: PropTypes.func,
        GET: PropTypes.func,
      }),
    }),
    resources: PropTypes.shape({
      patronBlockConditions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
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
    //this.formatMessage = intl.formatMessage;
  }

  componentDidMount() {
    const {
      mutator: { patronBlockConditions }
    } = this.props;

    patronBlockConditions.GET().then(records => {
      const defaultConfig = {
        blockBorrowing: false,
        blockRenewals: false,
        blockRequests: false,
        message: '',
      };
  
      if (records.length === 0) {
        console.log('ttt');
      }
    });
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
        stripes={this.props.stripes}
      />
    );
  }
}

export default withStripes(ChargedOutConditions);
