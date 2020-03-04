import React from 'react';
import PropTypes from 'prop-types';

import { stripesConnect } from '@folio/stripes-core';
import { EditCustomFieldsSettings } from '@folio/stripes/smart-components';

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

const EditCustomFields = ({
  history,
  stripes,
}) => {
  const redirectToView = () => {
    history.push('/settings/users/custom-fields');
  };

  const permissions = {
    canView: stripes.hasPerm('ui-users.settings.customfields.view'),
    canEdit: stripes.hasPerm('ui-users.settings.customfields.edit'),
    canDelete: stripes.hasPerm('ui-users.stripes.customfields.delete'),
  };

  return (
    <EditCustomFieldsSettings
      backendModuleName="users"
      entityType="user"
      redirectToView={redirectToView}
      permissions={permissions}
    />
  );
};

EditCustomFields.propTypes = propTypes;

export default stripesConnect(EditCustomFields);
