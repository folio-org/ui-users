import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  useUserAffiliations,
  useUserTenantRoles,
} from '../../../hooks';
import RenderRoles from '../../RenderRoles';
import { isAffiliationsEnabled } from '../../util';

const propTypes = {
  stripes: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
};

const UserRoles = (props) => {
  const { stripes, user } = props;
  const { id: userId } = useParams();
  const [tenantId, setTenantId] = useState(stripes.okapi.tenant);

  const {
    affiliations,
    isFetching: isAffiliationsFetching,
  } = useUserAffiliations({ userId }, { enabled: isAffiliationsEnabled(user) });

  const {
    userRoles,
    isFetching: isPermissionsFetching,
  } = useUserTenantRoles({ userId, tenantId });

  const isLoading = isAffiliationsFetching || isPermissionsFetching;
  const isAffiliationsVisible = isAffiliationsEnabled(user);

  useEffect(() => {
    if (!affiliations.some(({ tenantId: assigned }) => tenantId === assigned)) {
      setTenantId(stripes.okapi.tenant);
    }
  }, [affiliations, stripes.okapi.tenant, tenantId]);

  return (<RenderRoles
    {...props}
    heading={<FormattedMessage id="ui-users.roles.userRoles" />}
    permToRead="ui-authorization-roles.users.settings.view"
    affiliations={affiliations}
    selectedAffiliation={tenantId}
    isLoading={isLoading}
    onChangeAffiliation={setTenantId}
    isAffiliationsVisible={isAffiliationsVisible}
    listedRoles={userRoles || []}
  />);
};

UserRoles.propTypes = propTypes;

export default UserRoles;
