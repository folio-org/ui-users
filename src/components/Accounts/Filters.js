import React from 'react';
import PropTypes from 'prop-types';
import {
  Pane,
  SearchField,
  FilterGroups,
} from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';

const Filters = (props) => {
  if (props.showFilters === false) return '';
  const value = props.query.q || '';
  return (
    <Pane defaultWidth="16%" dismissible onClose={props.toggle} paneTitle={<FormattedMessage id="ui-users.accounts.history.filter" />}>
      <SearchField
        onChange={props.onChangeSearch}
        onClear={props.onClearSearch}
        value={value}
      />
      { (props.query.loan) ?
        <button
          type="button"
          onClick={() => {
            props.parentMutator.query.update({ loan: null });
          }}
        >
          {props.query.loan}
        </button>
        : ''}
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
  parentMutator: PropTypes.object,
  filterConfig: PropTypes.arrayOf(PropTypes.object),
  filters: PropTypes.object,
  onChangeFilter: PropTypes.func,
  onClearSearch: PropTypes.func,
  onClearFilters: PropTypes.func,
};

export default Filters;
