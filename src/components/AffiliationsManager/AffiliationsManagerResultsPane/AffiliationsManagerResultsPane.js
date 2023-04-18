import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Checkbox,
  MessageBanner,
  MultiColumnList,
  Pane,
  PaneMenu,
} from '@folio/stripes/components';
import { ExpandFilterPaneButton } from '@folio/stripes/smart-components';

import {
  AFFILIATIONS_COLUMN_WIDTHS,
  AFFILIATIONS_VISIBLE_COLUMNS,
} from '../constants';

const getColumnMapping = ({ allRecordsSelected, toggleAll }) => ({
  selected: (
    <FormattedMessage id="ui-users.affiliations.manager.modal.aria.assignAll">
      {label => (
        <Checkbox
          aria-label={label}
          checked={allRecordsSelected}
          onChange={toggleAll}
        />
      )}
    </FormattedMessage>
  ),
  name: <FormattedMessage id="ui-users.information.name" />,
  status: <FormattedMessage id="ui-users.information.status" />,
});

const getResultFormatter = ({ toggle, assignment }) => ({
  selected: affiliation => (
    <FormattedMessage id="ui-users.affiliations.manager.modal.aria.assign">
      {label => (
        <Checkbox
          aria-label={label}
          checked={Boolean(assignment[affiliation.id])}
          onChange={() => toggle(affiliation)}
        />
      )}
    </FormattedMessage>
  ),
  name: affiliation => affiliation.name,
  status: affiliation => (
    <FormattedMessage
      id={`ui-users.permissions.modal.${assignment[affiliation.id] ? 'assigned' : 'unassigned'}`}
    />
  ),
});

const AffiliationsManagerResultsPane = ({
  assignment,
  contentData,
  displayWarning,
  isAllAssigned,
  isFiltersVisible,
  isLoading,
  toggleFilters,
  toggleRecord,
  toggleAllRecords,
}) => {
  const paneSub = (
    <FormattedMessage
      id="ui-users.affiliations.manager.result.subTitle"
      values={{ amount: contentData.length }}
    />
  );

  const firstMenu = !isFiltersVisible && (
    <PaneMenu>
      <ExpandFilterPaneButton
        onClick={toggleFilters}
      />
    </PaneMenu>
  );

  const columnMapping = useMemo(() => getColumnMapping({
    allRecordsSelected: isAllAssigned,
    toggleAll: toggleAllRecords,
  }), [isAllAssigned, toggleAllRecords]);

  const formatter = useMemo(() => getResultFormatter({
    toggle: toggleRecord,
    assignment,
  }), [assignment, toggleRecord]);

  return (
    <Pane
      id="affiliations-manager-results-pane"
      defaultWidth="fill"
      paneTitle={<FormattedMessage id="ui-users.affiliations.manager.result.title" />}
      paneSub={paneSub}
      firstMenu={firstMenu}
    >
      <MessageBanner
        show={displayWarning}
        type="warning"
      >
        <FormattedMessage id="ui-users.affiliations.manager.modal.warning.unassigned" />
      </MessageBanner>

      <MultiColumnList
        id="user-affiliations-list"
        columnWidths={AFFILIATIONS_COLUMN_WIDTHS}
        visibleColumns={AFFILIATIONS_VISIBLE_COLUMNS}
        contentData={contentData}
        columnMapping={columnMapping}
        formatter={formatter}
        loading={isLoading}
      />
    </Pane>
  );
};

AffiliationsManagerResultsPane.propTypes = {
  assignment: PropTypes.object.isRequired,
  contentData: PropTypes.arrayOf(PropTypes.object).isRequired,
  displayWarning: PropTypes.bool.isRequired,
  isAllAssigned: PropTypes.bool.isRequired,
  isFiltersVisible: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  toggleAllRecords: PropTypes.func.isRequired,
  toggleFilters: PropTypes.func.isRequired,
  toggleRecord: PropTypes.func.isRequired,
};

export default AffiliationsManagerResultsPane;
