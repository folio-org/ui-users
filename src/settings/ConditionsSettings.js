import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Settings } from '@folio/stripes/smart-components';

import ChargedOutConditions from './patronBlocks/ChargedOutConditions';
import OutstandingConditions from './patronBlocks/OutstandingConditions';
import LostItemConditions from './patronBlocks/LostItemConditions';
import OverdueItemConditions from './patronBlocks/OverdueItemConditions';
import OverdueRecallConditions from './patronBlocks/OverdueRecallConditions';
import RecallOverdueByConditions from './patronBlocks/RecallOverdueByConditions';

const conditions = [
  {
    route: 'maximum-fee-fine-balance',
    labelKey: 'ui-users.settings.feefine.balance',
    component: OutstandingConditions,
  },
  {
    route: 'maximum-items-charged',
    labelKey: 'ui-users.settings.items.charged',
    component: ChargedOutConditions,
  },
  {
    route: 'maximum-lost-items',
    labelKey: 'ui-users.settings.lost.items',
    component: LostItemConditions,
  },
  {
    route: 'maximum-overdue-items',
    labelKey: 'ui-users.settings.overdue.items',
    component: OverdueItemConditions,
  },
  {
    route: 'maximum-overdue-recalls',
    labelKey: 'ui-users.settings.overdue.recalls',
    component: OverdueRecallConditions,
  },
  {
    route: 'maximum-overdue-days',
    labelKey: 'ui-users.settings.overdue.recallMax',
    component: RecallOverdueByConditions,
  }
];

function getConditions(conditionItems) {
  const routes = [];
  conditionItems.forEach(({ route, labelKey, component }) => {
    routes.push({
      route,
      label: <FormattedMessage id={labelKey} />,
      component,
    });
  });
  return routes;
}

export default (props) => <Settings
  {...props}
  navPaneWidth="20%"
  pages={getConditions(conditions)}
  paneTitle={<FormattedMessage id="ui-users.settings.conditions" />}
/>;
