/* eslint-disable react/prop-types */
import React from 'react';

import { MultiSelectionFilter } from '@folio/stripes/smart-components';

import usePermissionSets from './hooks/usePermissionSets';

const PermissionSetsFilter = (props) => {
  const filteredUsersIds = props?.resources?.records?.records.map(user => user.id);

  const { permissions, isLoading, isFetching } = usePermissionSets({ userIds: filteredUsersIds });
  const selectedPermissionSets = [];

  return (
    <MultiSelectionFilter
      dataOptions={permissions.map(p => ({ label: p, value: p }))}
      name="tags"
      selectedValues={selectedPermissionSets}
      onChange={props.onChange}
      aria-labelledby="users-filter-accordion-tags"
    />
  );
};
export default PermissionSetsFilter;
