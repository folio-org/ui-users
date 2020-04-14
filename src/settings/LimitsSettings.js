import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { isEmpty } from 'lodash';

import {
  stripesConnect,
  withStripes,
} from '@folio/stripes/core';
import { Settings } from '@folio/stripes/smart-components';

import Limits from './patronBlocks/Limits/Limits';

class LimitsSettings extends Component {
  static manifest = Object.freeze({
    query: {},
    groups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
      },
      records: 'usergroups',
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
        path: 'patron-block-limits?limit=1500',
      }
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

  capitilizeLabel = (label) => {
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  getPatronBlockConditions = () => {
    return this.props?.resources?.patronBlockCondition?.records ?? [];
  }

  getPatronBlockLimits = () => {
    return this.props?.resources?.patronBlockLimits?.records ?? [];
  }

  getPatronGroups = () => {
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
      const capitilizedPatronGroup = this.capitilizeLabel(patronGroup);
      const renderLimits = () => {
        return (
          <Limits
            patronGroupId={id}
            patronGroup={capitilizedPatronGroup}
            patronBlockConditions={this.getPatronBlockConditions()}
            patronBlockLimits={this.getPatronBlockLimits()}
          />
        );
      };

      routes.push({
        route: id,
        label: capitilizedPatronGroup,
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
        pages={this.getPatronGroups()}
      />
    );
  }
}

export default injectIntl(withStripes(stripesConnect(LimitsSettings)));
