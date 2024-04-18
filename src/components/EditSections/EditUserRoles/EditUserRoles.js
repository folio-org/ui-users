import React, { useState } from 'react';
import { Accordion, Headline, Badge, Row, Col, List, Button, Icon, Loading } from '@folio/stripes/components';
import { useIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { useUserTenantRoles } from '../../../hooks';

function EditUserRoles({ match, accordionId }) {
  const userId = match.params.id;

  const intl = useIntl();
  const [open, setOpen] = useState(false);

  const { userRoles, isLoading } = useUserTenantRoles({ userId, tenantId: 'diku2' });

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
    <Accordion
      label={<Headline size="large" tag="h3"><FormattedMessage id="ui-users.roles.userRoles" /></Headline>}
      open={open}
      id={accordionId}
      onToggle={() => { setOpen(!open); }}
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
      </Row>
    </Accordion>
  );
}

EditUserRoles.propTypes = {
  match: PropTypes.shape({ params: { id: PropTypes.string } }),
  accordionId: PropTypes.string
};

export default withRouter(EditUserRoles);
