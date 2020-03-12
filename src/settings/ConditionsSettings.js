import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Settings } from '@folio/stripes/smart-components';
import { stripesConnect } from '@folio/stripes/core';

import Conditions from './patronBlocks/Conditions/Conditions';

const PATRON_BLOCK_CONDITION_LOCALIZATION_MAP = {
  '3d7c52dc-c732-4223-8bf8-e5917801386f': 'patronBlockConditions.maximumNumberOfItemsChargedOut',
  '72b67965-5b73-4840-bc0b-be8f3f6e047e': 'patronBlockConditions.maximumNumberOfLostItems',
  '584fbd4f-6a34-4730-a6ca-73a6a6a9d845': 'patronBlockConditions.maximumNumberOfOverdueItems',
  'e5b45031-a202-4abb-917b-e1df9346fe2c': 'patronBlockConditions.maximumNumberOfOverdueRecalls',
  'cf7a0d5f-a327-4ca1-aa9e-dc55ec006b8a': 'patronBlockConditions.maximumOutstandingFeeFineBalance',
  '08530ac4-07f2-48e6-9dda-a97bc2bf7053': 'patronBlockConditions.recallOverdueByMaximumNumberOfDays',
};

class ConditionsSettings extends Component {
  static manifest = Object.freeze({
    entries: {
      type: 'okapi',
      records: 'patronBlockConditions',
      path: 'patron-block-conditions',
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      entries: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      entries: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }),
  };

  getConditions = () => {
    const {
      resources: {
        entries: {
          records: patronBlockConditions,
        }
      }
    } = this.props;
    const routes = [];

    patronBlockConditions.forEach((patronBlockCondition) => {
      const {
        id,
      } = patronBlockCondition;
      const name = <FormattedMessage id={`ui-users.${PATRON_BLOCK_CONDITION_LOCALIZATION_MAP[id]}`} />;

      function tempConditions() {
        return <Conditions {...patronBlockCondition} name={name} />;
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
    return !!this.props?.resources?.entries?.records.length;
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
