import React from 'react';
import { render } from '@folio/jest-config-stripes/testing-library/react';
import { sortBy } from 'lodash';
import { FormattedMessage } from 'react-intl';

import PermissionSets from './permissions/PermissionSets';
import PatronGroupsSettings from './PatronGroupsSettings';
import AddressTypesSettings from './AddressTypesSettings';
import CustomFieldsSettingsPane from './CustomFieldsSettings';
import DepartmentsSettings from './DepartmentsSettings';
import NumberGeneratorSettings from './NumberGeneratorSettings';

jest.mock('./permissions/PermissionSets', () => jest.fn(() => <div>PermissionSets</div>));

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
    component: NumberGeneratorSettings,
    label: <FormattedMessage id="ui-users.settings.numberGenerator.options" />,
    perm: 'ui-users.settings.manage-number-generator-options',
    route: 'number-generator-options',
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
    expect(getByText(/ui-users.settings.numberGenerator.options/i)).toBeInTheDocument();
    expect(getByText(/ui-users.settings.customFields/i)).toBeInTheDocument();
  });
});
