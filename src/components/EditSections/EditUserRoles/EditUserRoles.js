import React, { useState } from 'react';
import { Accordion, Headline, Badge, Row, Col, List, Button, Icon, Loading } from '@folio/stripes/components';
import { useIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { useStripes } from '@folio/stripes/core';
import { isEmpty } from 'lodash';
import { useUserTenantRoles, useUserRoles } from '../../../hooks';
import UserRolesModal from './components/UserRolesModal/UserRolesModal';
import { filtersConfig } from './helpers';

function EditUserRoles({ match, accordionId, assignedRoleIds, setAssignedRoleIds }) {
  const [isOpen, setIsOpen] = useState(false);
  const { okapi } = useStripes();
  const intl = useIntl();

  const userId = match.params.id;

  const { userRoles, isLoading } = useUserTenantRoles({ userId, tenantId: okapi.tenant });

  const { data: allRolesData } = useUserRoles();

  const handleRemoveRoleItem = (id) => {
    setAssignedRoleIds(assignedRoleIds.filter(assignedRoleId => assignedRoleId !== id));
  };

  const renderRoles = (role) => {
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
          onClick={() => handleRemoveRoleItem(role.id)}
        >
          <Icon icon="times-circle" />
        </Button>
      </li>
    );
  };

  const renderListItems = () => {
    if (isEmpty(assignedRoleIds)) return [];

    return assignedRoleIds.map(roleId => {
      const foundUserRole = allRolesData?.roles?.find(role => roleId === role.id);

      return { name: foundUserRole?.name, id: foundUserRole?.id };
    });
  };

  return (
    <div>
      <Accordion
        label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.roles.userRoles" /></Headline>}
        id={accordionId}
        displayWhenClosed={isLoading ? <Loading /> : <Badge>{userRoles.length}</Badge>}
      >
        <Row>
          <Col xs={12}>
            <List
              items={renderListItems()}
              itemFormatter={renderRoles}
              isEmptyMessage={<FormattedMessage id="ui-users.roles.empty" />}
            />
          </Col>
          <Button onClick={() => setIsOpen(true)}><FormattedMessage id="ui-users.roles.addRoles" /></Button>
          <Button><FormattedMessage id="ui-users.roles.unassignAllRoles" /></Button>
        </Row>
      </Accordion>
      <UserRolesModal
        filtersConfig={filtersConfig}
        assignedRoles={userRoles}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        assignedRoleIds={assignedRoleIds}
        setAssignedRoleIds={setAssignedRoleIds}
      />
    </div>
  );
}

EditUserRoles.propTypes = {
  match: PropTypes.shape({ params: { id: PropTypes.string } }),
  accordionId: PropTypes.string,
  assignedRoleIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  setAssignedRoleIds: PropTypes.func.isRequired
};

export default withRouter(EditUserRoles);
