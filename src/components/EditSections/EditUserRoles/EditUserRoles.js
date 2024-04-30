import React, { useState } from 'react';
import { Accordion, Headline, Badge, Row, Col, List, Button, Icon, Loading } from '@folio/stripes/components';
import { useIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { useStripes } from '@folio/stripes/core';
import { useUserTenantRoles } from '../../../hooks';
import UserRolesModal from './components/UserRolesModal/UserRolesModal';
import { filtersConfig } from './helpers';

function EditUserRoles({ match, accordionId }) {
  const [isOpen, setIsOpen] = useState(false);
  const { okapi } = useStripes();
  const intl = useIntl();

  const userId = match.params.id;

  const { userRoles, isLoading } = useUserTenantRoles({ userId, tenantId: okapi.tenant });

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
        >
          <Icon icon="times-circle" />
        </Button>
      </li>
    );
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
              items={userRoles}
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
      />
    </div>
  );
}

EditUserRoles.propTypes = {
  match: PropTypes.shape({ params: { id: PropTypes.string } }),
  accordionId: PropTypes.string
};

export default withRouter(EditUserRoles);
