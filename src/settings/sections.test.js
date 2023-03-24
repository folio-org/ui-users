import React from 'react';
import { render } from '@testing-library/react';
import { sortBy } from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  PermissionSets,
  PatronGroupsSettings,
  AddressTypesSettings,
  CustomFieldsSettingsPane,
  DepartmentsSettings,
} from './sections';

const settingsGeneral = [
  {
    route: 'perms',
    label: <FormattedMessage id="ui-users.settings.permissionSet" />,
    component: PermissionSets,
    perm: 'ui-users.settings.permsets',
  },
  {
    route: 'groups',
    label: <FormattedMessage id="ui-users.settings.patronGroups" />,
    component: PatronGroupsSettings,
    perm: 'ui-users.settings.usergroups',
  },
  {
    route: 'addresstypes',
    label: <FormattedMessage id="ui-users.settings.addressTypes" />,
    component: AddressTypesSettings,
    perm: 'ui-users.settings.addresstypes',
  },
  {
    route: 'departments',
    label: <FormattedMessage id="ui-users.settings.departments" />,
    component: DepartmentsSettings,
    perm: 'ui-users.settings.departments.view'
  },
  {
    route: 'custom-fields',
    label: <FormattedMessage id="ui-users.settings.customFields" />,
    component: CustomFieldsSettingsPane,
    perm: 'ui-users.settings.customfields.view',
  }
];

describe('sections', () => {
  it('settingsGeneral array is sorted by label', () => {
    const sortedSettings = sortBy(settingsGeneral, ['label']);
    const { getByText } = render(
      <div>
        {sortedSettings.map((s, index) => {
          return (
            <div key={index}>
              {s.label}
            </div>
          );
        })};
      </div>
    );
    expect(getByText(/ui-users.settings.permissionSet/i)).toBeInTheDocument();
    expect(getByText(/ui-users.settings.patronGroups/i)).toBeInTheDocument();
    expect(getByText(/ui-users.settings.addressTypes/i)).toBeInTheDocument();
    expect(getByText(/ui-users.settings.departments/i)).toBeInTheDocument();
    expect(getByText(/ui-users.settings.customFields/i)).toBeInTheDocument();
  });
});
