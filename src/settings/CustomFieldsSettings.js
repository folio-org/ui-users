import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { useIntl } from 'react-intl';

import { useStripes, TitleManager } from '@folio/stripes/core';
import { ViewCustomFieldsSettings, EditCustomFieldsSettings } from '@folio/stripes/smart-components';

import {
  CUSTOM_FIELDS_SECTION,
  CUSTOM_FIELDS_LABEL_SCOPE,
} from '../constants';

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

const CustomFieldsSettings = ({
  history,
}) => {
  const { formatMessage } = useIntl();
  const stripes = useStripes();

  const base = '/settings/users/custom-fields';

  const permissions = {
    canView: stripes.hasPerm('ui-users.settings.customfields.view'),
    canEdit: stripes.hasPerm('ui-users.settings.customfields.edit'),
    canDelete: stripes.hasPerm('ui-users.settings.customfields.all'),
  };

  const backendModuleName = 'users';
  const entityType = 'user';

  const displayInAccordionOptions = [
    {
      value: CUSTOM_FIELDS_SECTION.USER_INFO,
      label: formatMessage({ id: 'ui-users.information.userInformation' }),
    },
    {
      value: CUSTOM_FIELDS_SECTION.EXTENDED_INFO,
      label: formatMessage({ id: 'ui-users.extended.extendedInformation' }),
    },
    {
      value: CUSTOM_FIELDS_SECTION.CONTACT_INFO,
      label: formatMessage({ id: 'ui-users.contact.contactInfo' }),
    },
    {
      value: CUSTOM_FIELDS_SECTION.FEES_FINES,
      label: formatMessage({ id: 'ui-users.accounts.title.feeFine' }),
    },
    {
      value: CUSTOM_FIELDS_SECTION.LOANS,
      label: formatMessage({ id: 'ui-users.loans.title' }),
    },
    {
      value: CUSTOM_FIELDS_SECTION.REQUESTS,
      label: formatMessage({ id: 'ui-users.requests.title' }),
    },
  ];

  if (!permissions.canView) {
    history.replace('/settings/users');
  }

  return (
    <TitleManager
      record={formatMessage({ id: 'ui-users.settings.customFields' })}
    >
      <Switch>
        <Route exact path={base}>
          <ViewCustomFieldsSettings
            backendModuleName={backendModuleName}
            entityType={entityType}
            editRoute={`${base}/edit`}
            permissions={permissions}
            scope={CUSTOM_FIELDS_LABEL_SCOPE}
            hasDisplayInAccordionField
            displayInAccordionOptions={displayInAccordionOptions}
          />
        </Route>
        <Route exact path={`${base}/edit`}>
          <EditCustomFieldsSettings
            backendModuleName={backendModuleName}
            entityType={entityType}
            viewRoute={base}
            permissions={permissions}
            scope={CUSTOM_FIELDS_LABEL_SCOPE}
            hasDisplayInAccordionField
            displayInAccordionOptions={displayInAccordionOptions}
          />
        </Route>
      </Switch>
    </TitleManager>
  );
};

CustomFieldsSettings.propTypes = propTypes;

export default CustomFieldsSettings;
