import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  isEmpty,
} from 'lodash';

import {
  stripesConnect,
  withStripes,
} from '@folio/stripes/core';
import { Settings } from '@folio/stripes/smart-components';

import Limits from './patronBlocks/Limits/Limits';

// Only 6 patron block conditions exist. If patron groups or
// patron block conditions limit change, then LIMITS_RECORDS must be changed as well.
// For now we have: 6 * 200 = 1200.
const LIMITS_RECORDS = '1200';

class LimitsSettings extends Component {
  static manifest = Object.freeze({
    query: {},
    groups: {
      type: 'okapi',
      records: 'usergroups',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '200',
      },
      resourceShouldRefresh: true,
    },
    patronBlockCondition: {
      type: 'okapi',
      records: 'patronBlockConditions',
      GET: {
        path: 'patron-block-conditions',
      },
      params: {
        query: 'cql.allRecords=1 sortby name',
      },
    },
    patronBlockLimits: {
      type: 'okapi',
      records: 'patronBlockLimits',
      GET: {
        path: 'patron-block-limits',
      },
      params: {
        query: 'cql.allRecords=1',
        limit: LIMITS_RECORDS,
      },
    },
  });

  static propTypes = {
    resources: PropTypes.shape({
      groups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      patronBlockCondition: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }).isRequired,
      patronBlockLimits: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }).isRequired,
    }),
  };

  static defaultProps = {
    resources: {
      groups: {}
    }
  }

  getPatronBlockConditions = () => {
    return this.props?.resources?.patronBlockCondition?.records ?? [];
  }

  getPatronBlockLimits = () => {
    return this.props?.resources?.patronBlockLimits?.records ?? [];
  }

  getPatronGroupsPages = () => {
    const {
      resources: {
        groups: {
          records: groups,
        }
      }
    } = this.props;
    const routes = [];

    groups.forEach((group) => {
      const {
        id,
        group: patronGroup,
      } = group;
      const renderLimits = () => {
        return (
          <Limits
            key={id}
            patronGroupId={id}
            patronGroup={patronGroup}
            patronBlockConditions={this.getPatronBlockConditions()}
            patronBlockLimits={this.getPatronBlockLimits()}
          />
        );
      };

      routes.push({
        route: id,
        label: patronGroup,
        component: renderLimits,
      });
    });

    return routes;
  }

  shouldRenderSettings = () => {
    const { resources } = this.props;
    const patronGroups = resources?.groups?.records ?? [];

    return !isEmpty(patronGroups);
  }

  render() {
    if (!this.shouldRenderSettings()) return null;

    return (
      <Settings
        {...this.props}
        navPaneWidth="fill"
        paneTitle={<FormattedMessage id="ui-users.settings.limits" />}
        pages={this.getPatronGroupsPages()}
      />
    );
  }
}

export default injectIntl(withStripes(stripesConnect(LimitsSettings)));
