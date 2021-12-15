import React from 'react';
import { render, screen } from '@testing-library/react';
import { within } from '@testing-library/dom';

import '__mock__/reactFinalFormArrays.mock';
import '__mock__/intl.mock';

import PermissionsAccordionList from './PermissionsAccordionList';

jest.unmock('@folio/stripes/components');

jest.mock('../data/converters/permission', () => ({
  getPermissionLabelString: (i) => i.permissionName,
}));

jest.mock('./PermissionsAccordionListItem', () => (
  // eslint-disable-next-line react/prop-types
  ({ item }) => <li role="menuitem">{item.permissionName}</li>
));

const perms = [
  { permissionName: 'anna' },
  { permissionName: 'betty' },
  { permissionName: 'catherine' },
  { permissionName: 'darlene' },
  { permissionName: 'eleanore' },
];

describe('PermissionsAccordionList', () => {
  test('lists permissions', async () => {
    const palProps = {
      fields: {
        value: perms,
      },
      showPerms: true,
      getAssignedPermissions: () => perms,
      permToDelete: 'canDelete',
    };

    render(<PermissionsAccordionList {...palProps} />);

    perms.forEach((p) => {
      expect(screen.queryByText(p.permissionName)).toBeTruthy();
    });
  });


  test('sorts permissions', async () => {
    const shuffled = [...perms].sort(() => Math.random() - 0.5);
    const palProps = {
      fields: {
        value: shuffled,
      },
      showPerms: true,
      getAssignedPermissions: () => shuffled,
      permToDelete: 'canDelete',
    };

    render(<PermissionsAccordionList {...palProps} />);

    const sorted = screen.getAllByRole('menuitem');
    sorted.forEach((p, i) => {
      expect(within(p).getByText(perms[i].permissionName)).toBeTruthy();
    });
  });

  test('omits permissions not in the field', async () => {
    const palProps = {
      fields: {
        value: perms.slice(0, 3),
      },
      showPerms: true,
      getAssignedPermissions: () => perms,
      permToDelete: 'canDelete',
    };

    render(<PermissionsAccordionList {...palProps} />);

    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });
});
