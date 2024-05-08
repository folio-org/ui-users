import React, { useMemo, useState } from 'react';
import { Accordion, Headline, Badge, Row, Col, List, Button, Icon, Loading, ConfirmationModal } from '@folio/stripes/components';
import { useIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { useStripes } from '@folio/stripes/core';
import { isEmpty } from 'lodash';
import { FieldArray } from 'react-final-form-arrays';
import { OnChange } from 'react-final-form-listeners';
import { useUserTenantRoles, useAllRolesData } from '../../../hooks';
import UserRolesModal from './components/UserRolesModal/UserRolesModal';
import { filtersConfig } from './helpers';

function EditUserRoles({ match, accordionId, form:{ change }, initialValues }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unassignModalOpen, setUnassignModalOpen] = useState(false);
  const [assignedRoleIds, setAssignedRoleIds] = useState(initialValues.assignedRoleIds);
  const { okapi } = useStripes();
  const intl = useIntl();
  const userId = match.params.id;

  const { userRoles, isLoading } = useUserTenantRoles({ userId, tenantId: okapi.tenant });
  const { data: allRolesData } = useAllRolesData();

  const changeUserRoles = (roleIds) => {
    change('assignedRoleIds', roleIds);
  };

  const handleUnassignAllRoles = () => {
    changeUserRoles([]);
    setUnassignModalOpen(false);
  };

  const listItemsData = useMemo(() => {
    if (isEmpty(assignedRoleIds)) return [];

    return assignedRoleIds.map(roleId => {
      const foundUserRole = allRolesData?.roles?.find(role => roleId === role.id);

      return { name: foundUserRole?.name, id: foundUserRole?.id };
    });
  }, [assignedRoleIds, allRolesData]);

  const unassignAllMessage = <FormattedMessage
    id="ui-users.roles.modal.unassignAll.label"
    values={{ roles: listItemsData.map(d => d.name).join(', ') }}
  />;

  const renderRoleComponent = (fields) => (_, index) => {
    if (isEmpty(fields.value)) return null;

    const roleId = fields.value[index];
    const role = allRolesData?.roles?.find(r => roleId === r.id);

    if (!role) return null;
    return (
      <li
        data-test-user-role={role.id}
        key={role.id}
      >
        {role.name}
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
    return (
      <Col xs={12}>
        <FieldArray
          name="assignedRoleIds"
          component={renderUserRolesComponent}
        />
      </Col>
    );
  }

  return (
    <div>
      <Accordion
        label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.roles.userRoles" /></Headline>}
        id={accordionId}
        displayWhenClosed={isLoading ? <Loading /> : <Badge>{userRoles.length}</Badge>}
      >
        <Row>
          {renderUserRoles()}
          <Button data-testId="add-roles-button" onClick={() => setIsOpen(true)}><FormattedMessage id="ui-users.roles.addRoles" /></Button>
          <Button data-testId="unassign-all-roles-button" disabled={isEmpty(listItemsData)} onClick={() => setUnassignModalOpen(true)}><FormattedMessage id="ui-users.roles.unassignAllRoles" /></Button>
        </Row>
      </Accordion>
      <UserRolesModal
        filtersConfig={filtersConfig}
        assignedRoles={userRoles}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialRoleIds={assignedRoleIds}
        changeUserRoles={changeUserRoles}
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
          const userRoleIds = isEmpty(userAssignedRoleIds) ? [] : userAssignedRoleIds;
          setAssignedRoleIds(userRoleIds);
        }}
      </OnChange>
    </div>
  );
}

EditUserRoles.propTypes = {
  match: PropTypes.shape({ params: { id: PropTypes.string } }),
  accordionId: PropTypes.string,
  form: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired
};

export default withRouter(EditUserRoles);
