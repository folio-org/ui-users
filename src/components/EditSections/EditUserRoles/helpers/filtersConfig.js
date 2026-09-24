import React from 'react';
import { FormattedMessage } from 'react-intl';
import createBinaryStatusFilter from './createBinaryStatusFilter';

export const statusFilterConfig = createBinaryStatusFilter({
  label: <FormattedMessage id="ui-users.roles.modal.filter.status.label" />,
  name: 'status',
  trueValue: {
    displayName: <FormattedMessage id="ui-users.roles.modal.assigned" />,
    name: 'assigned',
  },
  falseValue: {
    displayName: <FormattedMessage id="ui-users.roles.modal.unassigned" />,
    name: 'unassigned',
  },
});

export const selectionFilterConfig = createBinaryStatusFilter({
  label: <FormattedMessage id="ui-users.roles.modal.filter.selection.label" />,
  name: 'selection',
  trueValue: {
    displayName: <FormattedMessage id="ui-users.roles.modal.selected" />,
    name: 'selected',
  },
  falseValue: {
    displayName: <FormattedMessage id="ui-users.roles.modal.unselected" />,
    name: 'unselected',
  },
});

const filtersConfig = [statusFilterConfig, selectionFilterConfig];

export default filtersConfig;
