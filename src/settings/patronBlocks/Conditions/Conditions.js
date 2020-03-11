import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ConfigManager } from '@folio/stripes/smart-components';
import {
  withStripes,
} from '@folio/stripes/core';

import ConditionsForm from './ConditionsForm';
import css from './conditions.css';

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
  };

  constructor(props) {
    super(props);

    this.configManager = this.props.stripes.connect(ConfigManager);
  }

  getInitialValues = () => {
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
    };
  }

  render() {
    const {
      name,
    } = this.props;

    return (
      <section className={css.conditionsWrapper}>
        <this.configManager
          label={name}
          moduleName="USERS"
          configName="patron_block_conditions"
          configFormComponent={ConditionsForm}
          getInitialValues={this.getInitialValues}
          stripes={this.props.stripes}
        />
      </section>
    );
  }
}

export default withStripes(Conditions);
