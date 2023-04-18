import PropTypes from 'prop-types';
import { useCallback, useMemo, useReducer } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  Paneset,
} from '@folio/stripes/components';

import {
  useConsortiumTenants,
  useToggle,
  useUserAffiliations,
} from '../../../hooks';
import {
  AffiliationsManagerFiltersPane,
  filtersConfig,
  filtersReducer,
} from '../AffiliationsManagerFiltersPane';
import AffiliationsManagerResultsPane from '../AffiliationsManagerResultsPane';
import useAffiliationsAssignment from '../useAffiliationsAssignment';
import AffiliationsManagerModalFooter from './AffiliationsManagerModalFooter';

import css from '../AffiliationsManager.css';
import { SEARCH_FIELD_NAME } from '../constants';

const INITIAL_FILTERS = {};

const AffiliationManagerModal = ({ onClose, onSubmit, userId }) => {
  const [isFiltersVisible, toggleFilters] = useToggle(true);
  const [filters, dispatch] = useReducer(filtersReducer, INITIAL_FILTERS);

  const {
    affiliations,
    isLoading: isUsersAffiliationsLoading,
  } = useUserAffiliations({ userId });

  const {
    tenants,
    isLoading: isConsortiumTenantsLoading,
  } = useConsortiumTenants();

  const {
    assignment,
    isAllAssigned,
    toggle,
    toggleAll,
    totalAssigned,
  } = useAffiliationsAssignment({ affiliations, tenants });

  // TODO: provide calculated changes in assignment to onSubmit()
  const handleOnSubmit = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  const modalFooter = (
    <AffiliationsManagerModalFooter
      onCancel={onClose}
      onSubmit={handleOnSubmit}
      totalSelected={totalAssigned}
    />
  );

  const contentData = useMemo(() => {
    const {
      [SEARCH_FIELD_NAME]: searchQuery,
      ...activeFilters
    } = filters;

    return filtersConfig
      .reduce((filtered, config) => config.filter(filtered, activeFilters, assignment), tenants)
      .filter(({ name }) => (searchQuery ? name.toLowerCase().includes(searchQuery.toLowerCase()) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [assignment, filters, tenants]);

  // TODO: add logic to display unassigned affiliations
  const displayWarning = true;

  const isLoading = isConsortiumTenantsLoading || isUsersAffiliationsLoading;

  return (
    <Modal
      open
      id="affiliations-manager-modal"
      contentClass={css.modalContent}
      dismissible
      footer={modalFooter}
      label={<FormattedMessage id="ui-users.affiliations.manager.modal.title" />}
      onClose={onClose}
      size="large"
      showHeader
    >
      <Paneset isRoot static>
        <AffiliationsManagerFiltersPane
          filters={filters}
          dispatch={dispatch}
          isFiltersVisible={isFiltersVisible}
          toggleFilters={toggleFilters}
          isLoading={isLoading}
        />

        <AffiliationsManagerResultsPane
          assignment={assignment}
          contentData={contentData}
          displayWarning={displayWarning}
          isAllAssigned={isAllAssigned}
          isFiltersVisible={isFiltersVisible}
          isLoading={isLoading}
          toggleFilters={toggleFilters}
          toggleRecord={toggle}
          toggleAllRecords={toggleAll}
        />
      </Paneset>
    </Modal>
  );
};

AffiliationManagerModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default AffiliationManagerModal;
