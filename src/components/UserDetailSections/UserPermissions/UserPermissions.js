import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { useStripes } from '@folio/stripes/core';

import {
  useUserAffiliations,
  useUserTenantPermissions,
} from '../../../hooks';
import RenderPermissions from '../../RenderPermissions';

const propTypes = {
  userPermissions: PropTypes.arrayOf(PropTypes.object),
  stripes: PropTypes.object.isRequired,
};

const UserPermissions = (props) => {
  const stripes = useStripes();
  const { id: userId } = useParams();
  const [tenantId, setTenantId] = useState(stripes.okapi.tenant);

  const {
    affiliations,
    isFetching: isAffiliationsFetching,
  } = useUserAffiliations({ userId });

  const {
    userPermissions,
    isFetching: isPermissionsFetching,
  } = useUserTenantPermissions({ userId, tenantId });

  const isLoading = isAffiliationsFetching || isPermissionsFetching;

  return (<RenderPermissions
    {...props}
    heading={<FormattedMessage id="ui-users.permissions.userPermissions" />}
    permToRead="perms.users.get"
    affiliations={affiliations}
    isLoading={isLoading}
    onChangeAffiliation={setTenantId}
    listedPermissions={userPermissions}
  />);
};

UserPermissions.propTypes = propTypes;

export default UserPermissions;
