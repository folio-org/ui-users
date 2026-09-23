import React, { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Button, Modal, Pane, PaneHeader, Paneset } from '@folio/stripes/components';
import { CollapseFilterPaneButton, ExpandFilterPaneButton } from '@folio/stripes/smart-components';
import UserRolesList from '../UserRolesList/UserRolesList';
import SearchForm from '../SearchForm/SearchForm';
import { useAllRolesData } from '../../../../../hooks';
import { filtersConfig, statusFilterConfig, selectionFilterConfig } from '../../helpers';
import css from './index.css';
import useRolesModalFilters from './useRolesModalFilters';

export default function UserRolesModal({ isOpen,
  onClose,
  changeUserRoles,
  initialRoleIds,
  tenantId }) {
  const [filterPaneIsVisible, setFilterPaneIsVisible] = useState(true);
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [assignedRoleIds, setAssignedRoleIds] = useState(initialRoleIds);
  const [selectionSnapshot, setSelectionSnapshot] = useState(initialRoleIds);
  const { filters, onChangeFilter, onClearFilter, resetFilters } = useRolesModalFilters();
  const { data: allRolesData, allRolesMapStructure } = useAllRolesData({ tenantId });

  // The Selected/Unselected filter reads from a local snapshot of the initial selection, so a role
  // doesn't disappear from the list the instant its checkbox is toggled. It only refreshes when
  // initialRoleIds changes, or when filters/search change (never on a plain checkbox click).
  const previousInitialRoleIdsRef = useRef(initialRoleIds);
  const filtersKey = `${JSON.stringify(filters)}|${submittedSearchTerm}`;
  const previousFiltersKeyRef = useRef(filtersKey);

  if (previousInitialRoleIdsRef.current !== initialRoleIds) {
    previousInitialRoleIdsRef.current = initialRoleIds;
    previousFiltersKeyRef.current = filtersKey;
    setAssignedRoleIds(initialRoleIds);
    setSelectionSnapshot(initialRoleIds);
  } else if (previousFiltersKeyRef.current !== filtersKey) {
    previousFiltersKeyRef.current = filtersKey;
    setSelectionSnapshot(assignedRoleIds);
  }

  const handleCloseModal = () => {
    setAssignedRoleIds(initialRoleIds);
    setSubmittedSearchTerm('');
    resetFilters();
    onClose();
  };

  const getFilteredRoles = () => {
    if (!allRolesData?.roles) return [];

    const idsByFilterName = {
      [statusFilterConfig.name]: initialRoleIds[tenantId],
      [selectionFilterConfig.name]: selectionSnapshot[tenantId],
    };

    let filtered = allRolesData.roles;
    filtersConfig.forEach((filterConfig) => {
      filtered = filterConfig.filter(filtered, filters, idsByFilterName[filterConfig.name]);
    });

    return filtered.filter(role => role.name.trim().toLowerCase().includes(submittedSearchTerm.trim().toLowerCase()));
  };

  const toggleRole = (id) => {
    if (assignedRoleIds[tenantId]?.includes(id)) {
      setAssignedRoleIds({ ...assignedRoleIds, [tenantId]: assignedRoleIds[tenantId].filter(role => role !== id) });
    } else {
      setAssignedRoleIds({ ...assignedRoleIds, [tenantId]: (assignedRoleIds[tenantId] || []).concat(id) });
    }
  };

  const toggleRoleList = (checked, roleList) => {
    if (checked) {
      const currentAssignedIds = assignedRoleIds[tenantId] || [];
      const currentPlusFiltered = new Set([...currentAssignedIds, ...roleList.map(role => role.id)]);
      setAssignedRoleIds({ ...assignedRoleIds, [tenantId]: Array.from(currentPlusFiltered) });
    } else {
      const idsToUnassign = roleList.map(role => role.id);
      const remainingIds = (assignedRoleIds[tenantId] || []).filter(id => !idsToUnassign.includes(id));
      setAssignedRoleIds({ ...assignedRoleIds, [tenantId]: remainingIds });
    }
  };

  const filteredRoles = getFilteredRoles();

  // eslint-disable-next-line no-unused-vars
  const getFilterConfigGroups = () => filtersConfig.map(({ filter, ...filterConfig }) => (filterConfig));

  const resetSearchForm = () => {
    setSubmittedSearchTerm('');
    resetFilters();
  };

  const handleSaveClick = () => {
    const sortedAlphabetically = (assignedRoleIds[tenantId] || [])
      .map(id => {
        const foundRole = allRolesMapStructure.get(id);
        return { name: foundRole?.name, id: foundRole?.id };
      })
      .sort((a, b) => a.name?.localeCompare(b.name))
      .map(r => r.id);
    changeUserRoles(sortedAlphabetically);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      id="user-roles-modal"
      label={<FormattedMessage id="ui-users.roles.modal.header" />}
      size="large"
      dismissible
      showHeader
      onClose={handleCloseModal}
      contentClass={css.modalContent}
      footer={
        <div className={css.modalFooter}>
          <Button
            id="clickable-permissions-modal-cancel"
            data-test-user-roles-modal-cancel
            marginBottom0
            onClick={handleCloseModal}
          >
            <FormattedMessage id="stripes-components.cancel" />
          </Button>
          <div>
            <FormattedMessage
              id="ui-users.permissions.modal.total"
              values={{ count: assignedRoleIds[tenantId]?.length || 0 }}
            />
          </div>
          <Button
            id="clickable-permissions-modal-save"
            data-test-user-roles-modal-save
            marginBottom0
            buttonStyle="primary"
            onClick={handleSaveClick}
          >
            <FormattedMessage id="stripes-components.saveAndClose" />
          </Button>
        </div>
      }
    >
      <div>
        <Paneset isRoot>
          {filterPaneIsVisible &&
            <Pane
              defaultWidth="30%"
              renderHeader={(renderProps) => (
                <PaneHeader
                  {...renderProps}
                  paneTitle={<FormattedMessage id="ui-users.roles.modal.search.header" />}
                  lastMenu={<CollapseFilterPaneButton onClick={() => setFilterPaneIsVisible(!filterPaneIsVisible)} />}
                  className={css.modalHeader}
                />
              )}
            >
              <SearchForm
                config={getFilterConfigGroups()}
                onSubmitSearch={setSubmittedSearchTerm}
                resetSearchForm={resetSearchForm}
                filters={filters}
                onChangeFilter={onChangeFilter}
                onClearFilter={onClearFilter}
              />
            </Pane>}
          <Pane
            defaultWidth="fill"
            renderHeader={renderProps => (
              <PaneHeader
                {...renderProps}
                paneTitle={<FormattedMessage id="ui-users.roles.userRoles" />}
                paneSub={
                  <FormattedMessage
                    id="ui-users.roles.modal.list.pane.subheader"
                    values={{ amount: filteredRoles.length }}
                  />
                }
                {...(filterPaneIsVisible || {
                  firstMenu: (
                    <ExpandFilterPaneButton
                      onClick={() => setFilterPaneIsVisible(true)}
                      filterCount={Object.keys(filters).length}
                    />
                  )
                }
                )}
              />
            )}
          >
            <UserRolesList
              assignedUserRoleIds={assignedRoleIds}
              initialUserRoleIds={initialRoleIds}
              filteredRoles={filteredRoles}
              toggleRole={toggleRole}
              toggleRoleList={toggleRoleList}
              tenantId={tenantId}
            />
          </Pane>
        </Paneset>
      </div>
    </Modal>
  );
}

UserRolesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialRoleIds: PropTypes.object,
  changeUserRoles: PropTypes.func.isRequired,
  tenantId: PropTypes.string.isRequired,
};
