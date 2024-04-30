import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  FilterGroups,
  SearchField,
  Icon,
} from '@folio/stripes/components';

import css from './SearchForm.css';

export default function SearchForm(props) {
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
        <FormattedMessage id="ui-users.userSearch">
          {label => (
            <SearchField
              data-test-search-field
              aria-label={label}
              name="query"
              onChange={({ target: { value } }) => { setSearchText(value); }}
              className={css.searchField}
              value={searchText}
              autoFocus
            />
          )}
        </FormattedMessage>
        <Button
          data-test-submit-button
          type="submit"
          buttonStyle="primary"
          fullWidth
          disabled={isEmpty(searchText)}
          marginBottom0
        >
          <FormattedMessage id="ui-users.search" />
        </Button>
      </div>
      <div>
        <Button
          buttonClass={css.resetButton}
          data-test-reset-all-button
          buttonStyle="none"
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
}

SearchForm.propTypes = {
  config: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  onSubmitSearch: PropTypes.func.isRequired,
  onChangeFilter: PropTypes.func.isRequired,
  onClearFilter: PropTypes.func.isRequired,
  resetSearchForm: PropTypes.func.isRequired,
};

