import React from 'react';
import PropTypes from 'prop-types';
import { ViewCustomFieldsSettings } from '@folio/stripes/smart-components';

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

const CustomFieldsSettings = ({
  history, stripes,
}) => {
  const redirectToEdit = () => {
    history.push('/users/custom-fields/edit');
  };

  return (
    <ViewCustomFieldsSettings
      backendModuleName="users"
      entityType="user"
      redirectToEdit={redirectToEdit}
      permissions={{
        canDelete: stripes.hasPerm('ui-users.settings.customfields.all'),
        canEdit: stripes.hasPerm('ui-users.settings.customfields.edit'),
        canView: stripes.hasPerm('ui-users.settings.customfields.view'),
      }}
    />
  );
};

CustomFieldsSettings.propTypes = propTypes;

export default CustomFieldsSettings;
