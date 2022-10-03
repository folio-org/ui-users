import React from 'react';
import PropTypes from 'prop-types';
import {
  noop,
} from 'lodash';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Pane,
  PaneMenu,
  Paneset,
} from '@folio/stripes/components';
import {
  SearchAndSortQuery,
  SearchAndSortNoResultsMessage as NoResultsMessage,
  CollapseFilterPaneButton,
  ExpandFilterPaneButton,
} from '@folio/stripes/smart-components';

import {
  Filters,
  LostItemsList,
} from './components';

class LostItemsListContainer extends React.Component {
  static propTypes = {
    onNeedMoreData: PropTypes.func.isRequired,
    queryGetter: PropTypes.func,
    querySetter: PropTypes.func,
    resources: PropTypes.shape({
      records: PropTypes.object,
    }).isRequired,
    mutator: PropTypes.shape({
      resultOffset: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
    }).isRequired,
    source: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      filterPaneIsVisible: true,
    };
  }

  toggleFilterPane = () => {
    this.setState(curState => ({
      filterPaneIsVisible: !curState.filterPaneIsVisible,
    }));
  }

  renderResultsFirstMenu(filters) {
    const {
      filterPaneIsVisible,
    } = this.state;

    if (filterPaneIsVisible) {
      return null;
    }

    const filterCount = filters.string !== '' ? filters.string.split(',').length : 0;

    return (
      <PaneMenu>
        <ExpandFilterPaneButton
          filterCount={filterCount}
          onClick={this.toggleFilterPane}
        />
      </PaneMenu>
    );
  }

  render() {
    const {
      querySetter,
      queryGetter,
      source,
      onNeedMoreData,
      resources,
      mutator: {
        resultOffset,
      },
    } = this.props;
    const {
      filterPaneIsVisible,
    } = this.state;

    const actualCostRecords = resources.records.records ?? [];
    const query = queryGetter ? queryGetter() || {} : {};
    const count = source ? source.totalCount() : 0;
    const sortOrder = query.sort || '';
    const emptyMessage = source
      ? <NoResultsMessage
          source={source}
          searchTerm={query.query || ''}
          filterPaneIsVisible
          toggleFilterPane={noop}
      />
      : null;
    let resultPaneSub = <FormattedMessage id="stripes-smart-components.searchCriteria" />;

    if (source && source.loaded()) {
      resultPaneSub = <FormattedMessage
        id="stripes-smart-components.searchResultsCountHeader"
        values={{ count }}
      />;
    }

    return (
      <SearchAndSortQuery
        initialSearchState={{ query: '' }}
        querySetter={querySetter}
        queryGetter={queryGetter}
      >
        {({
          onSort,
          getFilterHandlers,
          activeFilters,
        }) => {
          return (
            <Paneset id="lostItemsPaneSet">
              {filterPaneIsVisible &&
                <Pane
                  id="lostItemsFiltersPane"
                  defaultWidth="22%"
                  paneTitle={<FormattedMessage id="ui-users.lostItems.list.filters" />}
                  lastMenu={
                    <PaneMenu>
                      <CollapseFilterPaneButton onClick={this.toggleFilterPane} />
                    </PaneMenu>
                  }
                >
                  <Filters
                    activeFilters={activeFilters.state}
                    resources={resources}
                    onChangeHandlers={getFilterHandlers()}
                    resultOffset={resultOffset}
                  />
                </Pane>
              }
              <Pane
                id="lostItemsListPane"
                paneTitle={<FormattedMessage id="ui-users.lostItems.list.searchResults" />}
                paneSub={resultPaneSub}
                firstMenu={this.renderResultsFirstMenu(activeFilters)}
                defaultWidth="fill"
                padContent={false}
                noOverflow
              >
                <LostItemsList
                  contentData={actualCostRecords}
                  totalCount={count}
                  onNeedMoreData={onNeedMoreData}
                  emptyMessage={emptyMessage}
                  onSort={onSort}
                  sortOrder={sortOrder}
                />
              </Pane>
            </Paneset>
          );
        }}
      </SearchAndSortQuery>
    );
  }
}

export default LostItemsListContainer;
