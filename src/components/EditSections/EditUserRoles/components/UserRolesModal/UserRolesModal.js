import React, { useState } from 'react';
import { Button, Modal, Pane, PaneHeader, Paneset } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';
import { CollapseFilterPaneButton, ExpandFilterPaneButton } from '@folio/stripes/smart-components';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import css from './index.css';
import UserRolesList from '../UserRolesList/UserRolesList';
import useUserRoles from '../../../../../hooks/useUserRoles/useUserRoles';
import SearchForm from '../SearchForm/SearchForm';
import { filtersConfig, getInitialFiltersState } from '../../helpers';

export default function UserRolesModal({ isOpen, onClose, assignedRoles }) {
  const [filterPaneIsVisible, setFilterPaneIsVisible] = useState(true);
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [assignedRoleIds, setAssignedRoleIds] = useState(assignedRoles.map(role => role.id));
  const [filters, setFilters] = useState(getInitialFiltersState([filtersConfig]));

  const { data } = useUserRoles();

  const handleCloseModal = () => {
    setAssignedRoleIds(assignedRoles.map(role => role.id));
    onClose();
  };

  const getFilteredRoles = () => {
    if (!data?.roles) return [];

    let filtered = cloneDeep(data.roles);
    [filtersConfig].forEach((filterData) => {
      // eslint-disable-next-line no-unused-vars
      filtered = filterData.filter(filtered, filters, assignedRoleIds);
    });

    return filtered.filter(role => role.name.includes(submittedSearchTerm.trim().toLowerCase()));
  };

  // const resetSearchForm = () => setSubmittedSearchTerm('');

  const toggleRole = (id) => {
    if (assignedRoleIds.includes(id)) {
      setAssignedRoleIds(assignedRoleIds.filter(roleId => roleId !== id));
    } else {
      setAssignedRoleIds([...assignedRoleIds, id]);
    }
  };

  const toggleAllRoles = (checked) => {
    if (checked) setAssignedRoleIds(data?.roles.map(role => role.id));
    else setAssignedRoleIds([]);
  };

  const filteredRoles = getFilteredRoles();

  const getFilterConfigGroups = () => [filtersConfig].map(({ filte, ...filterConfig }) => (filterConfig));

  const onChangeFilter = ({ target: { name, checked } }) => {
    setFilters((prState) => {
      const updatedFilters = { ...prState };
      if (checked) {
        updatedFilters[name] = checked;
      } else {
        delete updatedFilters[name];
      }

      return updatedFilters;
    });
  };

  const onClearFilter = (filterName) => {
    setFilters((prevState) => {
      const updatedFilters = { ...prevState };

      Object.keys(updatedFilters).forEach((key) => {
        if (key.startsWith(filterName)) {
          delete updatedFilters[key];
        }
      });

      return updatedFilters;
    });
  };

  const resetSearchForm = () => {
    setAssignedRoleIds(assignedRoles.map(role => role.id));
    setFilters({});
  };

  return (
    <Modal
      open={isOpen}
      id="user-roles-modal"
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
              values={{ count: assignedRoleIds.length }}
            />
          </div>
          <Button
            id="clickable-permissions-modal-save"
            data-test-user-roles-modal-save
            marginBottom0
            buttonStyle="primary"
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
                  paneTitle="Search and filter"
                  lastMenu={<CollapseFilterPaneButton onClick={() => setFilterPaneIsVisible(!filterPaneIsVisible)} />}
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
            className={css.modalHeader}
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
              filteredRoles={filteredRoles}
              toggleRole={toggleRole}
              toggleAllRoles={toggleAllRoles}
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
  assignedRoles: PropTypes.array.isRequired
};
