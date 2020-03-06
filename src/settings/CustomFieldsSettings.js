import React from 'react';
import PropTypes from 'prop-types';

import { useStripes } from '@folio/stripes-core';
import { ViewCustomFieldsSettings } from '@folio/stripes/smart-components';

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

const CustomFieldsSettings = ({
  history,
}) => {
  const stripes = useStripes();

  const redirectToEdit = () => {
    history.push('/users/custom-fields/edit');
  };

  const permissions = {
    canView: stripes.hasPerm('ui-users.settings.customfields.view'),
    canEdit: stripes.hasPerm('ui-users.settings.customfields.edit'),
    canDelete: stripes.hasPerm('ui-users.stripes.customfields.delete'),
  };

  if (!permissions.canView) {
    history.replace('/settings/users');
  }

  return (
    <ViewCustomFieldsSettings
      backendModuleName="users"
      entityType="user"
      redirectToEdit={redirectToEdit}
      permissions={permissions}
    />
  );
};

CustomFieldsSettings.propTypes = propTypes;

export default CustomFieldsSettings;
