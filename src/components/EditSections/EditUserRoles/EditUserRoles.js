import React, { useEffect, useMemo, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { FieldArray } from 'react-final-form-arrays';
import { OnChange } from 'react-final-form-listeners';
import { useForm } from 'react-final-form';

import { IfPermission, useStripes } from '@folio/stripes/core';
import { Accordion, Headline, Badge, Row, Col, List, Button, Icon, ConfirmationModal } from '@folio/stripes/components';

import { useAllRolesData, useUserAffiliations } from '../../../hooks';
import AffiliationsSelect from '../../AffiliationsSelect/AffiliationsSelect';
import IfConsortium from '../../IfConsortium';
import IfConsortiumPermission from '../../IfConsortiumPermission';
import UserRolesModal from './components/UserRolesModal/UserRolesModal';
import { isAffiliationsEnabled } from '../../util/util';
import { filtersConfig } from './helpers';

function EditUserRoles({ 
  accordionId,
  form: { change },
  user,
  setAssignedRoleIds,
  assignedRoleIds,
  setTenantId,
  tenantId,
  initialAssignedRoleIds,
}) {
  const stripes = useStripes();
  const form = useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const intl = useIntl();

  const {
    affiliations,
    isFetching: isAffiliationsFetching,
  } = useUserAffiliations({ userId: user.id }, { enabled: isAffiliationsEnabled(user) });

  // console.log('affiliations', affiliations);

  // TODO: use roles data from useUserAffiliationRoles hook to have correct loading state
  const { 
    isLoading: isAllRolesDataLoading, 
    isFetching: isAllRolesDataFetching,
    allRolesMapStructure, 
    refetch,
    data: allRolesData,
  } = useAllRolesData({ tenantId });
  // console.log('allRolesMapStructure', allRolesMapStructure)
  // console.log('isAllRolesDataLoading11', isAllRolesDataLoading)

  // const isRolesDataLoading = isAllRolesDataLoading || isAffiliationsFetching;

  // useEffect(() => {
  //   console.log('allRolesData?.roles', allRolesData?.roles)
  //   console.log('initialAssignedRoleIds', initialAssignedRoleIds)
  //   const hasTenantAssignedRoles = tenantId in initialAssignedRoleIds;
  //   if (allRolesData?.roles && !hasTenantAssignedRoles) { // isEmpty(assignedRoleIds[tenantId])
  //     console.log('setAssignedRoleIds called')
  //     setAssignedRoleIds(prevAssignedRoleIds => ({
  //       ...prevAssignedRoleIds,
  //       [tenantId]: [],
  //     }));
  //   }
  // }, [allRolesData?.roles]);

  useEffect(() => {
    if (!affiliations.some(({ tenantId: assigned }) => tenantId === assigned)) {
      setTenantId(stripes.okapi.tenant);
    } else {
      refetch();
    }
  }, [affiliations, stripes.okapi.tenant, setTenantId, tenantId, refetch]);

  // Initialize form field for the current tenant if it doesn't exist yet
  useEffect(() => {
    const formState = form.getState();
    const currentFieldValue = formState.values?.assignedRoleIds?.[tenantId];
    const hasInitialValue = initialAssignedRoleIds?.[tenantId];
    
    // If the form field doesn't exist but we have initial values for this tenant, initialize it
    if (currentFieldValue === undefined && hasInitialValue) {
      change(`assignedRoleIds.${tenantId}`, initialAssignedRoleIds[tenantId]);
    }
  }, [tenantId, initialAssignedRoleIds, form, change]);

  const changeUserRoles = (roleIds) => {
    change(`assignedRoleIds[${tenantId}]`, roleIds);
  };

  const handleUnassignAllRoles = () => {
    changeUserRoles([]);
    setUnassignModalOpen(false);
  };

  // console.log('allRolesMapStructure', allRolesMapStructure)

  const listItemsData = useMemo(() => {
    if (isEmpty(assignedRoleIds[tenantId]) || isAllRolesDataLoading) return [];

    const mappedRoleIds = [];
    assignedRoleIds[tenantId].forEach(roleId => {
      const foundUserRole = allRolesMapStructure.get(roleId);

      if (foundUserRole) {
        mappedRoleIds.push({ name: foundUserRole.name, id: foundUserRole.id });
      }
    });
    // console.log('mappedRoleIds', mappedRoleIds)

    return !isEmpty(mappedRoleIds) ? mappedRoleIds.sort((a, b) => a.name.localeCompare(b.name)) : [];
  }, [assignedRoleIds, isAllRolesDataLoading, allRolesMapStructure, tenantId]);

  console.log('listItemsData11', listItemsData)

  const unassignAllMessage = <FormattedMessage
    id="ui-users.roles.modal.unassignAll.label"
    values={{ roles: listItemsData.map(d => d.name).join(', ') }}
  />;

  const renderRoleComponent = (fields) => (_, index) => {
    const tenantValue = fields.value;
    if (isEmpty(tenantValue)) return null;

    const roleId = tenantValue[index];
    const role = allRolesMapStructure.get(roleId);

    if (!role) return null;
    return (
      <li
        data-test-user-role={role.id}
        key={role.id}
      >
        {role.name}
        <IfPermission perm="ui-authorization-roles.users.settings.manage">
          <Button
            buttonStyle="fieldControl"
            align="end"
            type="button"
            id={`clickable-remove-user-role-${role.id}`}
            aria-label={`${intl.formatMessage({ id:'ui-users.roles.deleteRole' })}: ${role.name}`}
            onClick={() => fields.remove(index)}
          >
            <Icon icon="times-circle" />
          </Button>
        </IfPermission>
      </li>
    );
  };

  const renderUserRolesComponent = ({ fields }) => {
    console.log('fields', fields)
    return (
      <List
        items={listItemsData}
        itemFormatter={renderRoleComponent(fields)}
        isEmptyMessage={<FormattedMessage id="ui-users.roles.empty" />}
      />
    );
  };

  function renderUserRoles() {
    // console.log('isAllRolesDataFetching', isAllRolesDataFetching)
    if (isAllRolesDataFetching || isAllRolesDataLoading || isAffiliationsFetching) {
      return (
        <div style={{ width: '100%', paddingBottom: '20px' }}>
          <Icon icon="spinner-ellipsis" />
        </div>
      );
    }

    return (
      <Col xs={12}>
        <FieldArray
          name={`assignedRoleIds.${tenantId}`}
          component={renderUserRolesComponent}
        />
      </Col>
    );
  }

  // console.log('isAllRolesDataLoading || isAffiliationsFetching', isAllRolesDataLoading || isAffiliationsFetching)
  // console.log('isEmpty(listItemsData)', isEmpty(listItemsData))

  return (
    <IfPermission perm="ui-authorization-roles.users.settings.view">
      <div>
        <Accordion
          label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.roles.userRoles" /></Headline>}
          id={accordionId}
          displayWhenClosed={<Badge>{assignedRoleIds[tenantId]?.length}</Badge>}
        >
          <Row>
            <IfConsortium>
              <IfConsortiumPermission perm="consortia.user-tenants.collection.get">
                {Boolean(affiliations?.length) && (
                  <AffiliationsSelect
                    affiliations={affiliations}
                    onChange={setTenantId}
                    isLoading={isAllRolesDataLoading || isAffiliationsFetching}
                    value={tenantId}
                  />
                )}
              </IfConsortiumPermission>
            </IfConsortium>
            {renderUserRoles()}
            <IfPermission perm="ui-authorization-roles.users.settings.manage">
              <Button
                data-testid="add-roles-button" 
                onClick={() => setIsOpen(true)}
                disabled={isAllRolesDataFetching || isAllRolesDataLoading || isAffiliationsFetching}
              >
                <FormattedMessage id="ui-users.roles.addRoles" />
              </Button>
              <Button 
                data-testid="unassign-all-roles-button" 
                disabled={isEmpty(listItemsData) || isAllRolesDataFetching || isAllRolesDataLoading || isAffiliationsFetching} 
                onClick={() => setUnassignModalOpen(true)}
              >
                <FormattedMessage id="ui-users.roles.unassignAllRoles" />
              </Button>
            </IfPermission>
          </Row>
        </Accordion>
        <UserRolesModal
          filtersConfig={filtersConfig}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          initialRoleIds={assignedRoleIds}
          changeUserRoles={changeUserRoles}
          tenantId={tenantId}
        />
        <ConfirmationModal
          open={unassignModalOpen}
          heading={<FormattedMessage id="ui-users.roles.modal.unassignAll.header" />}
          message={unassignAllMessage}
          onConfirm={handleUnassignAllRoles}
          onCancel={() => setUnassignModalOpen(false)}
          cancelLabel={<FormattedMessage id="ui-users.no" />}
          confirmLabel={<FormattedMessage id="ui-users.yes" />}
        />
        <OnChange name="assignedRoleIds">
          {(userAssignedRoleIds) => {
            console.log('userAssignedRoleIds111111', userAssignedRoleIds)
            setAssignedRoleIds((prevAssignedRoleIds) => {
              if (isEmpty(userAssignedRoleIds)) {
                return { ...prevAssignedRoleIds, [tenantId]: [] };
              }
              return { ...prevAssignedRoleIds, [tenantId]: userAssignedRoleIds[tenantId] };
            });
          }}
        </OnChange>
      </div>
    </IfPermission>
  );
}

EditUserRoles.propTypes = {
  match: PropTypes.shape({ params: { id: PropTypes.string } }),
  accordionId: PropTypes.string,
  form: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  assignedRoleIds: PropTypes.object.isRequired,
  setAssignedRoleIds: PropTypes.func.isRequired,
  tenantId: PropTypes.string.isRequired,
  setTenantId: PropTypes.func.isRequired
};

export default withRouter(EditUserRoles);
