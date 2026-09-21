import PropTypes from 'prop-types';

import { IfPermission, useStripes } from '@folio/stripes/core';
import { TextLink } from '@folio/stripes/components';

import { getRoleDetailPath } from '../util/util';

const RoleNameLink = ({ role, canRenderLink = true }) => {

  return (
    <IfPermission perm="ui-authorization-roles.settings.view">
      {({ hasPermission }) => (hasPermission && canRenderLink
        ? <TextLink to={getRoleDetailPath(role.id)} target="_blank">{role.name}</TextLink>
        : <>{role.name}</>
      )}
    </IfPermission>
  );
};

RoleNameLink.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default RoleNameLink;
