import PropTypes from 'prop-types';
import {
  difference,
  intersection,
  orderBy,
} from 'lodash';
import {
  useCallback,
  useMemo,
  useReducer,
} from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  Paneset,
} from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import {
  useConsortiumTenants,
  useSortingMCL,
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
import {
  AFFILIATIONS_COLUMN_NAMES,
  AFFILIATIONS_SORTABLE_FIELDS,
  SEARCH_FIELD_NAME,
} from '../constants';
import AffiliationsManagerModalFooter from './AffiliationsManagerModalFooter';

import css from '../AffiliationsManager.css';

const INITIAL_FILTERS = {};

const AffiliationManagerModal = ({ onClose, onSubmit, userId }) => {
  const [isFiltersVisible, toggleFilters] = useToggle(true);
  const [filters, dispatch] = useReducer(filtersReducer, INITIAL_FILTERS);
  const stripes = useStripes();
  const currentUserTenants = useMemo(() => stripes.user?.user?.tenants || [], [stripes]);

  const {
    sortOrder,
    sortDirection,
    changeSorting,
  } = useSortingMCL(AFFILIATIONS_SORTABLE_FIELDS);

  const {
    affiliations,
    isLoading: isUsersAffiliationsLoading,
  } = useUserAffiliations({ userId }, { assignedToCurrentUser: false });

  const {
    tenants,
    isLoading: isConsortiumTenantsLoading,
  } = useConsortiumTenants();

  const primaryAffiliation = useMemo(() => affiliations.find(({ isPrimary }) => isPrimary), [affiliations]);
  const affiliationIds = useMemo(() => {
    const excludePrimaryAffiliation = ({ id }) => {
      return id !== primaryAffiliation?.tenantId;
    };

    return currentUserTenants.filter(excludePrimaryAffiliation).map(({ id }) => id);
  }, [currentUserTenants, primaryAffiliation]);

  const {
    assignment,
    isAllAssigned,
    toggle,
    toggleAll,
    totalAssigned,
  } = useAffiliationsAssignment({
    affiliations,
    tenants,
    affiliationIds,
  });

  const isLoading = isConsortiumTenantsLoading || isUsersAffiliationsLoading;

  const handleOnSubmit = useCallback(async () => {
    const affiliationIdsToCompare = affiliations
      .filter(({ isPrimary }) => !isPrimary)
      .map(({ tenantId }) => tenantId);

    const getAffiliationIds = (assigned) => (
      Object
        .entries(assignment)
        .filter((entry => (assigned ? Boolean(entry[1]) : !entry[1])))
        .map(entry => entry[0])
    );

    const buildResult = (tenantIds) => tenantIds.map(tenantId => ({ tenantId, userId }));
    const added = buildResult(difference(getAffiliationIds(true), affiliationIdsToCompare));
    const removed = buildResult(intersection(getAffiliationIds(false), affiliationIdsToCompare));

    await onSubmit({ added, removed });
    onClose();
  }, [affiliations, assignment, onClose, onSubmit, userId]);

  const modalFooter = (
    <AffiliationsManagerModalFooter
      onCancel={onClose}
      onSubmit={handleOnSubmit}
      totalSelected={totalAssigned}
    />
  );

  const sorters = useMemo(() => ({
    [AFFILIATIONS_COLUMN_NAMES.name]: ({ name }) => name.toLocaleLowerCase(),
    [AFFILIATIONS_COLUMN_NAMES.status]: ({ id }) => Boolean(assignment[id]),
  }), [assignment]);

  const contentData = useMemo(() => {
    const {
      [SEARCH_FIELD_NAME]: searchQuery,
      ...activeFilters
    } = filters;

    return (
      orderBy(
        filtersConfig
          .reduce((filtered, config) => config.filter(filtered, activeFilters, assignment), tenants)
          .filter(({ name, isCentral, id }) => {
            const isNotValid = isCentral || primaryAffiliation?.tenantId === id || !affiliationIds.includes(id);

            if (isNotValid) return false;

            return (searchQuery ? name.toLowerCase().includes(searchQuery.toLowerCase()) : true);
          }),
        sorters[sortOrder],
        sortDirection.name,
      )
    );
  }, [
    affiliationIds,
    assignment,
    filters,
    primaryAffiliation,
    sortDirection.name,
    sortOrder,
    sorters,
    tenants,
  ]);

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
          isAllAssigned={isAllAssigned}
          isFiltersVisible={isFiltersVisible}
          isLoading={isLoading}
          sortDirection={sortDirection}
          sortOrder={sortOrder}
          changeSorting={changeSorting}
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
