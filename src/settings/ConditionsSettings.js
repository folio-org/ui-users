import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import { stripesConnect, TitleManager } from '@folio/stripes/core';
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
        GET: PropTypes.func,
      }).isRequired,
    }).isRequired,
    intl: PropTypes.object,
  };

  getConditionsPages = () => {
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

      function renderConditions() {
        return <Conditions id={id} />;
      }

      routes.push({
        route: id,
        label: name,
        component: renderConditions,
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
    const { intl: { formatMessage } } = this.props;

    return (
      <TitleManager
        record={formatMessage({ id: 'ui-users.settings.conditions' })}
      >
        {this.shouldRenderSettings() ?
          <Settings
            {...this.props}
            navPaneWidth="fill"
            pages={this.getConditionsPages()}
            paneTitle={<FormattedMessage id="ui-users.settings.conditions" />}
          /> :
          null}
      </TitleManager>
    );
  }
}

export default injectIntl(stripesConnect(ConditionsSettings));
