import React from 'react';
import PropTypes from 'prop-types';
import { ViewCustomFieldsSettings } from '@folio/stripes/smart-components';

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

const CustomFieldsSettings = ({
  history,
}) => {
  const redirectToEdit = () => {
    history.push('/users/custom-fields/edit');
  };

  return (
    <ViewCustomFieldsSettings
      backendModuleName="users"
      entityType="user"
      redirectToEdit={redirectToEdit}
    />
  );
};

CustomFieldsSettings.propTypes = propTypes;

export default CustomFieldsSettings;
