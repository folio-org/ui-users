import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  FilterGroups,
  SearchField,
  Icon,
} from '@folio/stripes/components';

import css from './SearchForm.css';

const SearchForm = (props) => {
  const {
    onSubmitSearch,
    onSearchChange,
    onChangeFilter,
    config,
    filters,
    resetSearchForm,
    onClearFilter,
    searchText,
  } = props;
  return (
    <form onSubmit={onSubmitSearch}>
      <div className={css.searchGroupWrap}>
        <SearchField
          aria-label="user search"
          name="query"
          onChange={onSearchChange}
          className={css.searchField}
          value={searchText}
          autoFocus
        />
        <Button
          type="submit"
          buttonStyle="primary"
          fullWidth
          marginBottom0
        >
          Search
        </Button>
      </div>
      <div className={css.resetButtonWrap}>
        <Button
          buttonStyle="none"
          id="clickable-reset-all"
          fullWidth
          onClick={resetSearchForm}
        >
          <Icon icon="times-circle-solid">
            <FormattedMessage id="stripes-smart-components.resetAll" />
          </Icon>
        </Button>
      </div>
      <FilterGroups
        config={config}
        filters={filters}
        onChangeFilter={onChangeFilter}
        onClearFilter={onClearFilter}
      />
    </form>
  );
};

SearchForm.propTypes = {
  config: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
  filters: PropTypes.object.isRequired,
  onSubmitSearch: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onChangeFilter: PropTypes.func.isRequired,
  onClearFilter: PropTypes.func.isRequired,
  resetSearchForm: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
};

export default SearchForm;
