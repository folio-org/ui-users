import React from 'react';
import PropTypes from 'prop-types';
import Pane from '@folio/stripes-components/lib/Pane';
import FilterGroups from '@folio/stripes-components/lib/FilterGroups';
import SearchField from '@folio/stripes-components/lib/SearchField';

const Filters = (props) => {
  if (props.showFilters === false) return '';
  const value = props.query.q || '';
  return (
    <Pane defaultWidth="16%" dismissible onClose={props.toggle} paneTitle="Search & Filter" >
      <SearchField
        onChange={props.onChangeSearch}
        onClear={props.onClearSearch}
        value={value}
      />
      <FilterGroups
        config={props.filterConfig}
        filters={props.filters}
        onChangeFilter={props.onChangeFilter}
        onClearFilter={props.onClearFilters}
      />
    </Pane>
  );
};

Filters.propTypes = {
  query: PropTypes.object,
  toggle: PropTypes.func,
  showFilters: PropTypes.bool,
  onChangeSearch: PropTypes.func,
  filterConfig: PropTypes.arrayOf(PropTypes.object),
  filters: PropTypes.object,
  onChangeFilter: PropTypes.func,
  onClearSearch: PropTypes.func,
  onClearFilters: PropTypes.func,
};

export default Filters;
