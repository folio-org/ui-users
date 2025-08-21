import { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { noop } from 'lodash';

import {
  Pane,
  PaneMenu,
  Paneset,
  Button,
  Icon,
  SearchField,
} from '@folio/stripes/components';
import {
  SearchAndSortQuery,
  SearchAndSortNoResultsMessage as NoResultsMessage,
  CollapseFilterPaneButton,
  ExpandFilterPaneButton,
} from '@folio/stripes/smart-components';

import PatronsPreRegistrationList from './PatronsPreRegistrationList';

const PatronsPreRegistrationListContainer = ({
  queryGetter,
  onClose,
  source,
  data,
  onNeedMoreData
}) => {
  const intl = useIntl();
  const [isSearchPaneVisible, setIsSearchPaneVisible] = useState(true);
  const query = queryGetter ? queryGetter() || {} : {};
  const sortOrder = query.sort || '';
  const count = source ? source.totalCount() : 0;
  const emptyMessage = source
    ? <NoResultsMessage
        source={source}
        searchTerm={query.query || ''}
        filterPaneIsVisible
        toggleFilterPane={noop}
        notLoadedMessage={<FormattedMessage id="ui-users.stagingRecords.notLoadedMessage" />}
    />
    : null;

  let resultPaneSub = <FormattedMessage id="stripes-smart-components.searchCriteria" />;

  if (source && source.loaded()) {
    resultPaneSub = <FormattedMessage
      id="stripes-smart-components.searchResultsCountHeader"
      values={{ count }}
    />;
  }

  const toggleSearchPane = () => {
    setIsSearchPaneVisible(prev => !prev);
  };

  const firstMenu = () => {
    if (!isSearchPaneVisible) {
      return (
        <PaneMenu>
          <ExpandFilterPaneButton
            onClick={toggleSearchPane}
          />
        </PaneMenu>
      );
    } else {
      return null;
    }
  };

  return (
    <SearchAndSortQuery
      initialSearchState={{ query: '' }}
      queryGetter={queryGetter}
      initialSearch=""
    >
      {
        ({
          getSearchHandlers,
          onSubmitSearch,
          searchValue,
          onSort,
          resetAll,
        }) => {
          const isResetButtonDisabled = !searchValue.query;

          return (
            <Paneset id="patronsPreRegistrationRecordsPaneSet">
              {
                isSearchPaneVisible && (
                  <Pane
                    id="preRegistrationsRecordsSearchPane"
                    defaultWidth="22%"
                    paneTitle={<FormattedMessage id="ui-users.stagingRecords.list.search" />}
                    lastMenu={
                      <PaneMenu>
                        <CollapseFilterPaneButton onClick={toggleSearchPane} />
                      </PaneMenu>
                  }
                  >
                    <form onSubmit={onSubmitSearch}>
                      <SearchField
                        aria-label={intl.formatMessage({ id: 'ui-users.stagingRecords.search.label' })}
                        autoFocus
                        autoComplete="off"
                        id="stagingRecordsSearch"
                        name="query"
                        onChange={(e) => {
                          if (e.target.value) {
                            getSearchHandlers().query(e);
                          } else {
                            getSearchHandlers().reset();
                          }
                        }}
                        placeholder={intl.formatMessage({ id : 'ui-users.stagingRecords.search.placeholder' })}
                        value={searchValue.query}
                      />
                      <Button
                        data-testid="stagingRecordsSearchButton"
                        id="stagingRecordsSearchButton"
                        type="submit"
                        buttonStyle="primary"
                        fullWidth
                        disabled={!searchValue.query}
                      >
                        <FormattedMessage id="ui-users.search" />
                      </Button>
                      <Button
                        buttonStyle="none"
                        id="preRegistrationListResetAllButton"
                        disabled={isResetButtonDisabled}
                        onClick={resetAll}
                      >
                        <Icon icon="times-circle-solid" size="small">
                          <FormattedMessage id="stripes-smart-components.resetAll" />
                        </Icon>
                      </Button>
                    </form>
                  </Pane>
                )
              }
              <Pane
                id="stagingRecordsListPane"
                paneTitle={<FormattedMessage id="ui-users.stagingRecords.list.searchResults" />}
                paneSub={resultPaneSub}
                firstMenu={firstMenu()}
                defaultWidth="fill"
                dismissible
                onClose={onClose}
                padContent={false}
                noOverflow
              >
                <PatronsPreRegistrationList
                  data={data}
                  isEmptyMessage={emptyMessage}
                  totalCount={count}
                  onSort={onSort}
                  sortOrder={sortOrder}
                  onNeedMoreData={onNeedMoreData}
                />
              </Pane>
            </Paneset>
          );
        }
      }
    </SearchAndSortQuery>
  );
};

PatronsPreRegistrationListContainer.propTypes = {
  onNeedMoreData: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  queryGetter: PropTypes.func.isRequired,
  source: PropTypes.shape({}).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default PatronsPreRegistrationListContainer;
