import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { PaneMenu } from '@folio/stripes/components';

import { SearchAndSortSearchButton as FilterPaneToggle } from '@folio/stripes/smart-components';

const ResultsFirstMenu = memo((props) => {
  const {
    filters,
    filterPaneIsVisible,
    toggleFilterPane,
  } = props;
  const filterCount = Object.keys(filters).length;
  const hideOrShowMessageId = filterPaneIsVisible
    ? 'ui-users.permissions.modal.hideSearchPane'
    : 'ui-users.permissions.modal.showSearchPane';

  return (
    <PaneMenu>
      <FormattedMessage
        id="ui-users.permissions.modal.numberOfFilters"
        values={{ count: filterCount }}
      >
        {appliedFiltersMessage => (
          <FormattedMessage id={hideOrShowMessageId}>
            {hideOrShowMessage => (
              <FilterPaneToggle
                visible={filterPaneIsVisible}
                aria-label={`${hideOrShowMessage} ${appliedFiltersMessage}`}
                onClick={toggleFilterPane}
                badge={!filterPaneIsVisible && filterCount ? filterCount : undefined}
              />
            )}
          </FormattedMessage>
        )}
      </FormattedMessage>
    </PaneMenu>
  );
});

ResultsFirstMenu.propTypes = {
  filters: PropTypes.object.isRequired,
  toggleFilterPane: PropTypes.func.isRequired,
  filterPaneIsVisible: PropTypes.bool.isRequired,
};

export default ResultsFirstMenu;
