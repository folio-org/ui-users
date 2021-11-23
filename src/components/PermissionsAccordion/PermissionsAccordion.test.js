import { screen, fireEvent, render } from '@testing-library/react';

import '__mock__/stripesCore.mock';

import renderWithFinalForm from 'helpers/renderWithFinalForm';
import PermissionsAccordion from './PermissionsAccordion';


jest.unmock('@folio/stripes/components');

const renderPermissionsAccordion = (props) => renderWithFinalForm(<PermissionsAccordion {...props} />);


const filtersConfig = [
  {
    cql: 'permissionType',
    filter: jest.fn((permissions) => {
      return permissions;
    }),
    label: <div>Label</div>,
    name: 'permissionType',
    values: [
      {
        cql: 'permissionSets',
        displayName: <div>Permissionsets</div>,
        name: 'permissionSets',
        value: false,
      },
      {
        cql: 'permissions',
        displayName: <div>permissionsss</div>,
        name: 'permissions',
        value: false,
      },
    ],
  },
  {
    cql: 'status',
    filter: jest.fn((permissions) => {
      return permissions;
    }),
    label: <div>status</div>,
    name: 'status',
    values: [
      {
        cql: 'assigned',
        displayName: <div>assigned</div>,
        name: 'assigned',
        value: false,
      },
      {
        cql: 'unassigned',
        displayName: <div>unassigned</div>,
        name: 'unassigned',
        value: false,
      },
    ],
  },
];

describe('render RenderPermissions component', () => {
  it('Component must be rendered', () => {
    const props = {
      accordionId: 'permSection',
      excludePermissionSets: false,
      expanded: true,
      filtersConfig,
      form: {
        getFieldState: jest.fn(),
      },
      headlineContent: <div>Permission</div>,
      formName: 'permissionSetForm',
      permToDelete: 'perms.permissions.item.put',
      permToModify: 'perms.permissions.item.put',
      permToRead: 'perms.permissions.get',
      permissionsField: 'subPermissions',
      assignedPermissionIds: ['822d0819-454c-4310-a341-9bd1d404a95f'],
      intl: {},
      onToggle: jest.fn(),
      visibleColumns: ['selected', 'permissionName', 'type', 'status']
    };
    renderPermissionsAccordion(props);
    expect(renderPermissionsAccordion(props)).toBeTruthy();
    screen.debug();
  });
});
