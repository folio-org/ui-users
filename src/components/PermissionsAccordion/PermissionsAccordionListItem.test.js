import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/reactFinalFormArrays.mock';
import '__mock__/intl.mock';

import PermissionsAccordionListItem from './PermissionsAccordionListItem';

jest.unmock('@folio/stripes/components');

jest.mock('../data/converters/permission', () => ({
  getPermissionLabelString: (i) => i.permissionName,
}));

describe('PermissionsAccordionListItem', () => {
  test('displays a permission', async () => {
    const palProps = {
      item: {
        id: 123,
        permissionName: 'funky',
      },
      permToDelete: 'arugula',
      fields: {},
    };

    render(<PermissionsAccordionListItem {...palProps} />);

    expect(screen.queryByText('funky')).toBeTruthy();
  });

  describe('handles remove button', () => {
    test('displays button given permission', async () => {
      const palProps = {
        item: {
          id: 123,
          permissionName: 'funky',
        },
        permToDelete: 'permission',
        fields: {},
      };

      render(<PermissionsAccordionListItem {...palProps} />);
      expect(screen.getByRole('button')).toBeTruthy();
    });

    test('clicking button fires callback', async () => {
      const palProps = {
        item: {
          id: 123,
          permissionName: 'funky',
        },
        permToDelete: 'permission',
        fields: {
          remove: jest.fn()
        },
      };

      render(<PermissionsAccordionListItem {...palProps} />);
      userEvent.click(screen.getByRole('button'));

      expect(palProps.fields.remove).toHaveBeenCalled();
    });

    test('hides button without permission', async () => {
      const palProps = {
        item: {
          id: 123,
          permissionName: 'funky',
        },
        permToDelete: 'nope',
        fields: {
          remove: jest.fn()
        },
      };

      render(<PermissionsAccordionListItem {...palProps} />);
      expect(screen.queryByRole('button')).toBeFalsy();
    });
  });
});
