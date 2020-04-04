import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import { stripesConnect, withStripes } from '@folio/stripes/core';
import { Settings } from '@folio/stripes/smart-components';

import Limits from './patronBlocks/Limits/Limits';
import { capitilizeLabel } from './patronBlocks/Limits/utils';

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
  });

  static propTypes = {
    resources: PropTypes.shape({
      groups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      groups: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

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
      const capitilizedPatronGroup = capitilizeLabel(patronGroup);

      function tempConditions() {
        return <Limits id={id} patronGroup={capitilizedPatronGroup} />;
      }

      routes.push({
        route: id,
        label: capitilizedPatronGroup,
        component: tempConditions,
      });
    });

    return routes;
  }

  shouldRenderSettings = () => {
    const { resources } = this.props;
    const patronGroups = resources?.groups?.records ?? [];

    return !!patronGroups.length;
  }

  render() {
    if (!this.shouldRenderSettings()) {
      return null;
    }

    return (
      <Settings
        {...this.props}
        navPaneWidth="fill"
        pages={this.getPatronGroups()}
        paneTitle={<FormattedMessage id="ui-users.settings.limits" />}
      />
    );
  }
}

export default injectIntl(withStripes(stripesConnect(LimitsSettings)));
