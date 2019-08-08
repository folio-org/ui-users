import React, { useState } from 'react';
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
    onChangeFilter,
    config,
    filters,
    resetSearchForm,
    onClearFilter,
  } = props;
  const [searchText, setSearchText] = useState('');
  const onFormSubmit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onSubmitSearch(searchText);
  };
  const onResetSearchForm = () => {
    setSearchText('');
    resetSearchForm();
  };

  return (
    <form onSubmit={onFormSubmit}>
      <div className={css.searchGroupWrap}>
        <SearchField
          aria-label="user search"
          name="query"
          onChange={({ target: { value } }) => { setSearchText(value); }}
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
          <FormattedMessage id="ui-users.search" />
        </Button>
      </div>
      <div className={css.resetButtonWrap}>
        <Button
          buttonStyle="none"
          id="clickable-reset-all"
          fullWidth
          onClick={onResetSearchForm}
        >
          <Icon icon="times-circle-solid">
            <FormattedMessage id="ui-users.permissions.modal.search.resetAll" />
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
  onChangeFilter: PropTypes.func.isRequired,
  onClearFilter: PropTypes.func.isRequired,
  resetSearchForm: PropTypes.func.isRequired,
};

export default SearchForm;
