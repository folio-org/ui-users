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
  Button,
  Icon,
  Callout,
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
  Search,
} from './components';
import { getPatronName } from './components/LostItemsList/util';
import { STATUS_CODES } from '../../../constants';

import styles from './LostItemsListContainer.css';

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
      billedRecord: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
    okapi: PropTypes.shape({
      currentUser: PropTypes.shape({
        curServicePoint: PropTypes.shape({
          id: PropTypes.string,
        }).isRequired,
      }).isRequired,
    }).isRequired,
    billedRecords: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      amount: PropTypes.string,
    })).isRequired,
    addBilledRecord: PropTypes.func.isRequired,
    source: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.callout = null;
    this.state = {
      filterPaneIsVisible: true,
    };
  }

  billRecord = (actualCost) => {
    const {
      mutator,
      okapi,
      addBilledRecord,
    } = this.props;
    const payload = {
      actualCostRecordId: actualCost.actualCostRecord.id,
      amount: Number(actualCost.additionalInfo.actualCostToBill),
      additionalInfoForStaff: actualCost.additionalInfo.additionalInformationForStaff,
      additionalInfoForPatron: actualCost.additionalInfo.additionalInformationForPatron,
      servicePointId: okapi.currentUser.curServicePoint?.id,
    };
    const patronName = getPatronName(actualCost.actualCostRecord);

    mutator.billedRecord.POST(payload)
      .then((res) => {
        const billedAmount = res.feeFine.billedAmount.toFixed(2);
        addBilledRecord({
          id: res.id,
          billedAmount,
        });
        const message = <FormattedMessage
          id="ui-users.lostItems.notification.success"
          values={{
            patronName,
            amount: billedAmount,
          }}
        />;

        this.callout.sendCallout({
          message,
        });
      })
      .catch((e) => {
        let message;

        if (e.status === STATUS_CODES.unprocessableEntity) {
          message = <FormattedMessage
            id="ui-users.lostItems.notification.alreadyBilled"
            values={{ patronName }}
          />;
        } else {
          message = <FormattedMessage id="ui-users.lostItems.notification.serverError" />;
        }

        this.callout.sendCallout({
          message,
          type: 'error',
        });
      });
  };

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
      billedRecords,
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
          resetAll,
          getSearchHandlers,
          searchValue,
          onSubmitSearch,
        }) => {
          const isResetButtonDisabled = !activeFilters.string && !searchValue.query;

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
                  <form
                    onSubmit={onSubmitSearch}
                    className={styles.lostItemsForm}
                  >
                    <Search
                      getSearchHandlers={getSearchHandlers}
                      searchValue={searchValue}
                    />
                    <Button
                      buttonStyle="none"
                      id="lostItemsResetAllButton"
                      disabled={isResetButtonDisabled}
                      onClick={resetAll}
                      buttonClass={styles.resetButton}
                    >
                      <Icon icon="times-circle-solid" size="small">
                        <FormattedMessage id="stripes-smart-components.resetAll" />
                      </Icon>
                    </Button>
                    <Filters
                      activeFilters={activeFilters.state}
                      resources={resources}
                      onChangeHandlers={getFilterHandlers()}
                      resultOffset={resultOffset}
                    />
                  </form>
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
                  billRecord={this.billRecord}
                  billedRecords={billedRecords}
                />
              </Pane>
              <Callout ref={(ref) => { this.callout = ref; }} />
            </Paneset>
          );
        }}
      </SearchAndSortQuery>
    );
  }
}

export default LostItemsListContainer;
