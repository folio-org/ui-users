import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ConfigManager } from '@folio/stripes/smart-components';
import {
  withStripes,
} from '@folio/stripes/core';

import ConditionsForm from './ConditionsForm';

class Conditions extends Component {
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
    resources: PropTypes.shape({
      patronBlockConditions: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      patronBlockConditions: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.configManager = this.props.stripes.connect(ConfigManager);
  }
  
  componentDidMount() {
    console.log('In component did mpount');
    console.log(this.props);
  }

  render() {
    const {
      name,
    } = this.props;

    return (
      <this.configManager
        label={name}
        moduleName="USERS"
        configName="patron_block__conditions"
        configFormComponent={ConditionsForm}
        getInitialValues={() => this.getInitialValues()}
        validate={this.validate}
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

  validate = (values) => {
    const errors = {};
    const {
      blockBorrowing,
      blockRenewals,
      blockRequests,
      message,
    } = values;

    console.log('.... values');
    console.log(values);

    return errors;
  }
}

export default withStripes(Conditions);
