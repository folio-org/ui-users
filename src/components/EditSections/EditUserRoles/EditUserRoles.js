import React, { useEffect, useMemo, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { FieldArray } from 'react-final-form-arrays';
import { OnChange } from 'react-final-form-listeners';

import { IfPermission, useStripes } from '@folio/stripes/core';
import { Accordion, Headline, Badge, Row, Col, List, Button, Icon, ConfirmationModal, Layout } from '@folio/stripes/components';

import { useAllRolesData, useUserAffiliations } from '../../../hooks';
import AffiliationsSelect from '../../AffiliationsSelect/AffiliationsSelect';
import IfConsortium from '../../IfConsortium';
import IfConsortiumPermission from '../../IfConsortiumPermission';
import UserRolesModal from './components/UserRolesModal/UserRolesModal';
import { isAffiliationsEnabled } from '../../util/util';
import { filtersConfig } from './helpers';

function EditUserRoles({ accordionId, form:{ change }, user, setAssignedRoleIds, assignedRoleIds, setTenantId, tenantId, isLoadingAffiliationRoles }) {
  const stripes = useStripes();
  const [isOpen, setIsOpen] = useState(false);
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const intl = useIntl();

  const {
    affiliations,
    isFetching: isAffiliationsFetching,
  } = useUserAffiliations({ userId: user.id }, { enabled: isAffiliationsEnabled(user) });

  const { isLoading: isAllRolesDataLoading, allRolesMapStructure, refetch, isFetching: isAllRolesDataFetching } = useAllRolesData({ tenantId });

  const isLoadingData = (
    isAffiliationsFetching
    || isLoadingAffiliationRoles
    || isAllRolesDataLoading
    || isAllRolesDataFetching
  );

  useEffect(() => {
    if (!affiliations.some(({ tenantId: assigned }) => tenantId === assigned)) {
      setTenantId(stripes.okapi.tenant);
    } else {
      refetch();
    }
  }, [affiliations, stripes.okapi.tenant, setTenantId, tenantId, refetch]);

  const changeUserRoles = (roleIds) => {
    change(`assignedRoleIds[${tenantId}]`, roleIds);
  };

  const handleUnassignAllRoles = () => {
    changeUserRoles([]);
    setUnassignModalOpen(false);
  };

  const listItemsData = useMemo(() => {
    if (isEmpty(assignedRoleIds[tenantId]) || isAllRolesDataLoading) return [];

    const mappedRoleIds = [];
    assignedRoleIds[tenantId].forEach(roleId => {
      const foundUserRole = allRolesMapStructure.get(roleId);

      if (foundUserRole) {
        mappedRoleIds.push({ name: foundUserRole.name, id: foundUserRole.id });
      }
    });
    return !isEmpty(mappedRoleIds) ? mappedRoleIds.sort((a, b) => a.name.localeCompare(b.name)) : [];
  }, [assignedRoleIds, isAllRolesDataLoading, allRolesMapStructure, tenantId]);

  const unassignAllMessage = <FormattedMessage
    id="ui-users.roles.modal.unassignAll.label"
    values={{ roles: listItemsData.map(d => d.name).join(', ') }}
  />;

  const renderRoleComponent = (fields) => (role) => {
    const tenantValue = fields.value;
    if (isEmpty(tenantValue)) return null;

    const fieldIndex = tenantValue.indexOf(role.id);

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
            onClick={() => fields.remove(fieldIndex)}
          >
            <Icon icon="times-circle" />
          </Button>
        </IfPermission>
      </li>
    );
  };

  const renderUserRolesComponent = ({ fields }) => {
    return (
      <List
        items={listItemsData}
        itemFormatter={renderRoleComponent(fields)}
        isEmptyMessage={<FormattedMessage id="ui-users.roles.empty" />}
      />
    );
  };

  function renderUserRoles() {
    if (isLoadingData) {
      return (
        <Layout className="full padding-bottom-gutter">
          <Icon icon="spinner-ellipsis" />
        </Layout>
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
              <Button disabled={isLoadingData} data-testid="add-roles-button" onClick={() => setIsOpen(true)}><FormattedMessage id="ui-users.roles.addRoles" /></Button>
              <Button data-testid="unassign-all-roles-button" disabled={isEmpty(listItemsData) || isLoadingData} onClick={() => setUnassignModalOpen(true)}><FormattedMessage id="ui-users.roles.unassignAllRoles" /></Button>
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
