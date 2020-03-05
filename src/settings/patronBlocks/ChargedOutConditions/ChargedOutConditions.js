import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

import { ConfigManager } from '@folio/stripes/smart-components';
import {
  withStripes,
} from '@folio/stripes/core';

import ChargedOutConditionsForm from './ChargedOutConditionsForm';

class ChargedOutConditions extends Component {
  static manifest = Object.freeze({
    conditions: {
      type: 'okapi',
      records: 'conditions',
      GET: {
        path: 'patron-block-conditions',
      },
      PUT: {
        path: 'patron-block-conditions/{patronBlockConditionId}',
      },
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      conditions: PropTypes.shape({
        PUT: PropTypes.func,
        GET: PropTypes.func,
      }),
    }),
    resources: PropTypes.shape({
      conditions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    const {
      stripes,
    } = props;

    this.configManager = stripes.connect(ConfigManager);
  }

  componentDidMount() {
    const {
      mutator: { conditions }
    } = this.props;

    //conditions.GET().then(record => console.log(record));

    console.log(this.props.mutator);
  }

  getInitialValues(settings) {
    console.log(settings);
    const defaultConfig = {
      blockBorrowing: false,
      blockRenewals: false,
      blockRequests: false,
      message: '',
    };

    return defaultConfig;
  }

  /*getInitialValues(settings) {
    console.log(settings);
    //const value = settings.length && settings[0].value === 'true';
    //return { profile_pictures: value };
  }*/

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
