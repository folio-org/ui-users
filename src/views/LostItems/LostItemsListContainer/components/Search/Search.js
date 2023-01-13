import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Button,
  SearchField,
} from '@folio/stripes/components';

import styles from './Search.css';

const Search = ({
  getSearchHandlers,
  searchValue,
}) => {
  const handleChange = useCallback((e) => {
    if (e.target.value) {
      getSearchHandlers().query(e);
    } else {
      getSearchHandlers().reset();
    }
  }, [getSearchHandlers]);

  return (
    <>
      <SearchField
        autoFocus
        aria-label="Lost items search"
        autoComplete="off"
        name="query"
        id="lostItemsSearch"
        data-testid="lostItemsSearch"
        onChange={handleChange}
        value={searchValue.query}
        className={styles.searchField}
        marginBottom0
      />
      <Button
        data-testid="lostItemsSearchButton"
        id="lostItemsSearchButton"
        type="submit"
        buttonStyle="primary"
        fullWidth
        disabled={!searchValue.query}
      >
        <FormattedMessage id="ui-users.search" />
      </Button>
    </>
  );
};

Search.propTypes = {
  searchValue: PropTypes.shape({
    query: PropTypes.string.isRequired,
  }).isRequired,
  getSearchHandlers: PropTypes.func.isRequired,
};

export default Search;
