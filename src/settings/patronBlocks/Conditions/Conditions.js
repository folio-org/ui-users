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
    initialValues: PropTypes.object.isRequired,
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
    form: PropTypes.object,
    handlers: PropTypes.shape({
      onClose: PropTypes.func.isRequired,
    }),
    handleSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    values: PropTypes.object,
    error: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.configManager = this.props.stripes.connect(ConfigManager);
  }

  getInitialValues = () => {
    console.log('this.props.initialValues');
    console.log(this.props.initialValues);
    return {
      ...this.props.initialValues
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
