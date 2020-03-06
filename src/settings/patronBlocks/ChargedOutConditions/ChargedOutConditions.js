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
  static propTypes = {
    mutator: PropTypes.shape({
      patronBlockConditions: PropTypes.shape({
        GET: PropTypes.func,
        PUT: PropTypes.func,
      }),
    }),
    resources: PropTypes.shape({
      patronBlockConditions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  static manifest = Object.freeze({
    patronBlockConditions: {
      type: 'okapi',
      records: 'patronBlockConditions',
      path: 'patron-block-conditions',
      accumulate: 'true',
    },
  });


  constructor(props) {
    super(props);

    this.state = {
      initialValues: {},
    }

    this.configManager = this.props.stripes.connect(ConfigManager);
  }

  componentDidMount() {
  }

  getInitialValues(conditions) {
    console.log(conditions);
  }

  render() {
    return (
      <this.configManager
        label={<FormattedMessage id="ui-users.settings.items.charged" />}
        moduleName="USERS"
        configName="chargeOutConditions"
        configFormComponent={ChargedOutConditionsForm}
        //getInitialValues={this.getInitialValues(conditionsRecord)}
        stripes={this.props.stripes}
      />
    );
  }
}

export default withStripes(ChargedOutConditions);
