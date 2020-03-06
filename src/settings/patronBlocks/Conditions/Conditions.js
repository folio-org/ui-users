import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ConfigManager } from '@folio/stripes/smart-components';
import {
  withStripes,
} from '@folio/stripes/core';

import ConditionsForm from './ConditionsForm';

class Conditions extends Component {
  constructor(props) {
    super(props);

    this.configManager = this.props.stripes.connect(ConfigManager);
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    blockBorrowing: PropTypes.bool.isRequired,
    blockRenewals: PropTypes.bool.isRequired,
    blockRequests: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
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

  render() {
    const {
      name,
    } = this.props;

    return (
      <this.configManager
        label={name}
        moduleName="USERS"
        configName="chargeOutConditions"
        configFormComponent={ConditionsForm}
        getInitialValues={() => this.getInitialValues()}
        stripes={this.props.stripes}
      />
    );
  }

  getInitialValues() {
    const {
      id,
      name,
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    } = this.props;

    return {
      id,
      name,
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    }
  }
}

export default withStripes(Conditions);
