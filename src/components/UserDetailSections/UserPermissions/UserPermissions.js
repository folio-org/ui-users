import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  useUserAffiliations,
  useUserTenantPermissions,
} from '../../../hooks';
import RenderPermissions from '../../RenderPermissions';
import { isAffiliationsEnabled } from '../../util';

const propTypes = {
  stripes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const UserPermissions = (props) => {
  const { stripes, user } = props;
  const { id: userId } = useParams();
  const [tenantId, setTenantId] = useState(stripes.okapi.tenant);

  const {
    affiliations,
    isFetching: isAffiliationsFetching,
  } = useUserAffiliations({ userId }, { enabled: isAffiliationsEnabled(user) });

  const {
    userPermissions,
    isFetching: isPermissionsFetching,
  } = useUserTenantPermissions({ userId, tenantId });

  const isLoading = isAffiliationsFetching || isPermissionsFetching;

  useEffect(() => {
    if (!affiliations.some(({ tenantId: assigned }) => tenantId === assigned)) {
      setTenantId(stripes.okapi.tenant);
    }
  }, [affiliations, stripes.okapi.tenant, tenantId]);

  return (<RenderPermissions
    {...props}
    heading={<FormattedMessage id="ui-users.permissions.userPermissions" />}
    permToRead="perms.users.get"
    affiliations={affiliations}
    selectedAffiliation={tenantId}
    isLoading={isLoading}
    onChangeAffiliation={setTenantId}
    listedPermissions={userPermissions}
  />);
};

UserPermissions.propTypes = propTypes;

export default UserPermissions;
