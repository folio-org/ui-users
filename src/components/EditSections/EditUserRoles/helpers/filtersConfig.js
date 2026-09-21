import React from 'react';
import { FormattedMessage } from 'react-intl';
import createBinaryStatusFilter from './createBinaryStatusFilter';

export const statusFilterConfig = createBinaryStatusFilter({
  label: <FormattedMessage id="ui-users.roles.modal.filter.status.label" />,
  name: 'status',
  cql: 'status',
  trueValue: {
    displayName: <FormattedMessage id="ui-users.roles.modal.assigned" />,
    name: 'assigned',
    cql: 'assigned',
  },
  falseValue: {
    displayName: <FormattedMessage id="ui-users.roles.modal.unassigned" />,
    name: 'unassigned',
    cql: 'unassigned',
  },
});

export const selectionFilterConfig = createBinaryStatusFilter({
  label: <FormattedMessage id="ui-users.roles.modal.filter.selection.label" />,
  name: 'selection',
  cql: 'selection',
  trueValue: {
    displayName: <FormattedMessage id="ui-users.roles.modal.selected" />,
    name: 'selected',
    cql: 'selected',
  },
  falseValue: {
    displayName: <FormattedMessage id="ui-users.roles.modal.unselected" />,
    name: 'unselected',
    cql: 'unselected',
  },
});

const filtersConfig = [statusFilterConfig, selectionFilterConfig];

export default filtersConfig;
