import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

import { useStripes } from '@folio/stripes/core';
import { ViewCustomFieldsSettings, EditCustomFieldsSettings } from '@folio/stripes/smart-components';

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

  const base = '/settings/users/custom-fields';

  const redirectToEdit = () => {
    history.push(`${base}/edit`);
  };

  const redirectToView = () => {
    history.push(`${base}`);
  };

  const permissions = {
    canView: stripes.hasPerm('ui-users.settings.customfields.view'),
    canEdit: stripes.hasPerm('ui-users.settings.customfields.edit'),
    canDelete: stripes.hasPerm('ui-users.settings.customfields.all'),
  };

  const backendModuleName = 'users';
  const entityType = 'user';


  if (!permissions.canView) {
    history.replace('/settings/users');
  }

  return (
    <Switch>
      <Route exact path={base}>
        <ViewCustomFieldsSettings
          backendModuleName={backendModuleName}
          entityType={entityType}
          redirectToEdit={redirectToEdit}
          permissions={permissions}
        />
      </Route>
      <Route exact path={`${base}/edit`}>
        <EditCustomFieldsSettings
          backendModuleName={backendModuleName}
          entityType={entityType}
          redirectToView={redirectToView}
          permissions={permissions}
        />
      </Route>
    </Switch>
  );
};

CustomFieldsSettings.propTypes = propTypes;

export default CustomFieldsSettings;
