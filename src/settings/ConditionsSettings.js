import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Settings } from '@folio/stripes/smart-components';

import Conditions from './patronBlocks/Conditions/Conditions';

class ConditionsSettings extends Component {
  static manifest = Object.freeze({
    query: {},
    patronBlockConditions: {
      type: 'okapi',
      path: 'patron-block-conditions',
      params: {
        query: 'cql.allRecords=1 sortby name',
      },
      records: 'patronBlockConditions',
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      patronBlockConditions: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      patronBlockConditions: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
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
    const { resources } = this.props;
    const patronBlockConditions = resources?.patronBlockConditions?.records ?? [];

    return !!patronBlockConditions.length;
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

export default ConditionsSettings;
