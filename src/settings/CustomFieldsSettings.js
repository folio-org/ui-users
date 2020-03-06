import React from 'react';
import PropTypes from 'prop-types';

import { withStripes } from '@folio/stripes-core';
import { ViewCustomFieldsSettings } from '@folio/stripes/smart-components';

const propTypes = {
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

const CustomFieldsSettings = ({
  history,
  stripes,
}) => {
  const redirectToEdit = () => {
    history.push('/users/custom-fields/edit');
  };

  const permissions = {
    canView: stripes.hasPerm('ui-users.settings.customfields.view'),
    canEdit: stripes.hasPerm('ui-users.settings.customfields.edit'),
    canDelete: stripes.hasPerm('ui-users.stripes.customfields.delete'),
  };

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

export default withStripes(CustomFieldsSettings);
