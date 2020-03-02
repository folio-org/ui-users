import React from 'react';
import PropTypes from 'prop-types';

import { EditCustomFieldsSettings } from '@folio/stripes/smart-components';

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

const EditCustomFields = ({
  history,
}) => {
  const redirectToView = () => {
    history.push('/settings/users/custom-fields');
  };

  return (
    <EditCustomFieldsSettings
      backendModuleName="users"
      entityType="user"
      redirectToView={redirectToView}
    />
  );
};

EditCustomFields.propTypes = propTypes;

export default EditCustomFields;
