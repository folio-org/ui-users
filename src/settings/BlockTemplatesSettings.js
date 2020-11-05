import React from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage, injectIntl } from 'react-intl';

import { stripesConnect, withStripes } from '@folio/stripes/core';
import { Settings } from '@folio/stripes/smart-components';

function BlockTemplateSettings(props) {
  const getBlockTemplatesPages = () => {
    const {
      resources: {
        manualBlockTemplates: { records: manualBlockTemplates },
      },
    } = props;
    const routes = [];

    manualBlockTemplates.forEach((patronBlockCondition) => {
      const { id, name } = patronBlockCondition;

      function renderConditions() {
        // return <Conditions id={id} />;
        return <div>id</div>;
      }

      routes.push({
        route: id,
        label: name,
        component: renderConditions,
      });
    });

    return routes;
  };

  const shouldRenderSettings = () => {
    const { resources } = props;
    const manualBlockTemplates = resources?.manualBlockTemplates?.records ?? [];

    return !!manualBlockTemplates.length;
  };

  if (!shouldRenderSettings()) return null;

  return (
    <Settings
      {...props}
      navPaneWidth="fill"
      pages={getBlockTemplatesPages()}
      // paneTitle={<FormattedMessage id="ui-users.settings.conditions" />}
      paneTitle="MANUAL BLOCKS"
    />
  );
}

BlockTemplateSettings.manifest = Object.freeze({
  query: {},
  manualBlockTemplates: {
    type: 'okapi',
    path: 'manual-block-templates',
    params: {
      query: 'cql.allRecords=1 sortby name',
    },
    records: 'manualBlockTemplates',
  },
});

BlockTemplateSettings.propTypes = {
  resources: PropTypes.shape({
    manualBlockTemplates: PropTypes.shape({
      records: PropTypes.arrayOf(PropTypes.object).isRequired,
    }).isRequired,
  }).isRequired,
  mutator: PropTypes.shape({
    manualBlockTemplates: PropTypes.shape({
      GET: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};

export default injectIntl(withStripes(stripesConnect(BlockTemplateSettings)));
