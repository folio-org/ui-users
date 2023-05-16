
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  useCallout,
  useStripes,
} from '@folio/stripes/core';

import PermissionsAccordion from '../../components/PermissionsAccordion';
import {
  statusFilterConfig,
  permissionTypeFilterConfig,
} from '../../components/PermissionsAccordion/helpers/filtersConfig';
import {
  useUserAffiliations,
  useUserTenantPermissions,
} from '../../hooks';

const errorsMap = {
  permissionsLoadFailed: 'permissionsLoadFailed',
  affiliationsLoadFailed: 'affiliationsLoadFailed',
};

const TenantsPermissionsAccordion = ({
  form,
  initialValues,
  setButtonRef,
}) => {
  const stripes = useStripes();
  const callout = useCallout();
  const [tenantId, setTenantId] = useState(stripes.okapi.tenant);
  const [isActionsDisabled, setActionsDisabled] = useState(false);

  const { change, getState } = form;
  const { id: userId, username } = initialValues;
  const permissionsField = `permissions.${tenantId}`;
  const isPermissionsPresent = get(getState().values, permissionsField);

  const initPermissionsValue = useCallback(({ permissionNames }) => {
    setActionsDisabled(false);

    if (!isPermissionsPresent) {
      change(permissionsField, permissionNames);
    }
  }, [change, isPermissionsPresent, permissionsField]);

  const handleError = useCallback(({ code }) => {
    setActionsDisabled(true);

    callout.sendCallout({
      message: (
        <FormattedMessage
          id={`ui-users.errors.${code}`}
          values={{
            tenantId,
            user: username || userId,
          }}
        />
      ),
      type: 'error',
      timeout: 0,
    });
  }, [callout, tenantId, userId, username]);

  const handleLoadAffiliationsError = useCallback(() => {
    handleError({ code: errorsMap.affiliationsLoadFailed });
  }, [handleError]);

  const handleLoadPermissionsError = useCallback(() => {
    handleError({ code: errorsMap.permissionsLoadFailed });
  }, [handleError]);

  const {
    affiliations,
    isFetching: isUserAffiliationsFetching,
  } = useUserAffiliations(
    { userId },
    {
      onError: handleLoadAffiliationsError
    },
  );

  const {
    isFetching: isUserPermissionsFetching,
  } = useUserTenantPermissions(
    { userId, tenantId },
    {
      onSuccess: initPermissionsValue,
      onError: handleLoadPermissionsError,
    },
  );

  const isLoading = isUserAffiliationsFetching || isUserPermissionsFetching;

  return (
    <PermissionsAccordion
      affiliations={affiliations}
      disabled={isActionsDisabled}
      isLoading={isLoading}
      onChangeAffiliation={setTenantId}
      tenantId={tenantId}
      initialValues={initialValues}
      filtersConfig={[
        permissionTypeFilterConfig,
        statusFilterConfig,
      ]}
      visibleColumns={[
        'selected',
        'permissionName',
        'type',
        'status',
      ]}
      accordionId="permissions"
      headlineContent={<FormattedMessage id="ui-users.permissions.userPermissions" />}
      permToRead="perms.users.get"
      permToDelete="perms.users.item.delete"
      permToModify="perms.users.item.put"
      formName="userForm"
      permissionsField={permissionsField}
      form={form}
      setButtonRef={setButtonRef}
    />
  );
};

TenantsPermissionsAccordion.propTypes = {
  initialValues: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  setButtonRef: PropTypes.func,
};

export default TenantsPermissionsAccordion;
