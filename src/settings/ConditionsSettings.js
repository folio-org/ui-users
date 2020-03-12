import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Settings } from '@folio/stripes/smart-components';
import { stripesConnect } from '@folio/stripes/core';

import Conditions from './patronBlocks/Conditions/Conditions';

class ConditionsSettings extends Component {
  static manifest = Object.freeze({
    patronBlockConditions: {
      type: 'okapi',
      records: 'patronBlockConditions',
      path: 'patron-block-conditions',
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      patronBlockConditions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      patronBlockConditions: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }),
  };

  getConditions = () => {
    const {
      resources: {
        patronBlockConditions: {
          records: patronBlockConditions,
        }
      }
    } = this.props;
    const routes = [];

    patronBlockConditions.forEach((patronBlockCondition) => {
      const {
        id,
        name,
      } = patronBlockCondition;

      function tempConditions() {
        return <Conditions id={id} />;
      }

      routes.push({
        route: id,
        label: name,
        component: tempConditions,
      });
    });

    return routes;
  }

  shouldRenderSettings = () => {
    return !!this.props?.resources?.patronBlockConditions?.records.length;
  }

  render() {
    if (!this.shouldRenderSettings()) {
      return null;
    }

    return (
      <Settings
        {...this.props}
        navPaneWidth="fill"
        pages={this.getConditions()}
        paneTitle={<FormattedMessage id="ui-users.settings.conditions" />}
      />
    );
  }
}

export default stripesConnect(ConditionsSettings);
