import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  FilterGroups,
  Icon,
  Pane,
  PaneMenu,
  SearchField,
} from '@folio/stripes/components';
import { CollapseFilterPaneButton } from '@folio/stripes/smart-components';

import {
  AFFILIATIONS_FILTERS_ACTION_TYPES,
  SEARCH_FIELD_NAME
} from '../constants';
import filtersConfig from './filtersConfig';

import css from '../AffiliationsManager.css';

const AffiliationsManagerFiltersPane = ({
  dispatch,
  filters,
  isFiltersVisible,
  isLoading,
  toggleFilters,
}) => {
  const [search, setSearch] = useState();

  const lastMenu = (
    <PaneMenu>
      <CollapseFilterPaneButton onClick={toggleFilters} />
    </PaneMenu>
  );

  const isSearchDisabled = isLoading || !search;
  const isResetAllDisabled = isLoading || !Object.keys(filters).length;

  const updateFilters = useCallback((payload) => {
    dispatch({
      type: AFFILIATIONS_FILTERS_ACTION_TYPES.updateFilters,
      payload,
    });
  }, [dispatch]);

  const handleSearchChange = useCallback(({ target: { value } }) => {
    setSearch(value);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    updateFilters([SEARCH_FIELD_NAME, search]);
  }, [search, updateFilters]);

  const handleFiltersChange = useCallback((e) => {
    const { target: { name, checked } } = e;

    updateFilters([name, checked]);
  }, [updateFilters]);

  const clearFilter = useCallback((groupName) => {
    dispatch({
      type: AFFILIATIONS_FILTERS_ACTION_TYPES.clearFilter,
      payload: groupName,
    });
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    clearFilter(SEARCH_FIELD_NAME);
  }, [clearFilter]);

  const clearAll = useCallback(() => {
    setSearch();
    dispatch({ type: AFFILIATIONS_FILTERS_ACTION_TYPES.clearAll });
  }, [dispatch]);

  if (!isFiltersVisible) return null;

  return (
    <Pane
      defaultWidth="30%"
      lastMenu={lastMenu}
      paneTitle={<FormattedMessage id="stripes-smart-components.searchAndFilter" />}
    >
      <form onSubmit={handleSubmit}>
        <FormattedMessage id="ui-users.affiliations.manager.modal.aria.search">
          {label => (
            <SearchField
              aria-label={label}
              disabled={isLoading}
              name={SEARCH_FIELD_NAME}
              onChange={handleSearchChange}
              onClear={clearSearch}
              value={search}
              autoFocus
            />
          )}
        </FormattedMessage>

        <Button
          type="submit"
          buttonStyle="primary"
          disabled={isSearchDisabled}
          fullWidth
        >
          <FormattedMessage id="ui-users.search" />
        </Button>

        <Button
          buttonClass={css.resetButton}
          buttonStyle="none"
          onClick={clearAll}
          disabled={isResetAllDisabled}
        >
          <Icon icon="times-circle-solid">
            <FormattedMessage id="stripes-smart-components.resetAll" />
          </Icon>
        </Button>

        <FilterGroups
          config={filtersConfig}
          filters={filters}
          onChangeFilter={handleFiltersChange}
          onClearFilter={clearFilter}
        />
      </form>
    </Pane>
  );
};

AffiliationsManagerFiltersPane.propTypes = {
  dispatch: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  isFiltersVisible: PropTypes.bool,
  isLoading: PropTypes.bool,
  toggleFilters: PropTypes.func.isRequired,
};

export default AffiliationsManagerFiltersPane;
