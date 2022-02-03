import React from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IfPermission } from '@folio/stripes/core';

import '__mock__/reactFinalFormArrays.mock';
import '__mock__/reactFinalFormListeners.mock';
import '__mock__/intl.mock';

import PermissionsAccordion from './PermissionsAccordion';

jest.unmock('@folio/stripes/components');

const changeFormMock = jest.fn();
const paProps = {
  accordionId: 'permissions-accordion',
  expanded: true,
  filtersConfig: [],
  form: {
    getFieldState: () => ({
      value: [
        { 'name': 'foo' },
      ]
    }),
  },
  formName: 'userForm',
  headlineContent: <span>headline</span>,
  onToggle: jest.fn(),
  permToRead: 'perms.users.get',
  permToDelete: 'perms.users.item.delete',
  permToModify: 'perms.users.item.put',
  permissionsField: 'permissions',
  visibleColumns: [],
};

jest.mock('./components/PermissionsModal', () => {
  // eslint-disable-next-line react/prop-types
  return ({ open }) => (open ? <div>PermissionsModal</div> : null);
});

const renderPermissionsAccordion = (extraProps = {}) => render(<PermissionsAccordion {...paProps} {...extraProps} />);

describe('PermissionsAccordion', () => {
  test('lists permissions', async () => {
    renderPermissionsAccordion({
      stripes: {
        hasPerm: (p) => p === paProps.permToRead
      },
    });

    expect(screen.getByTestId(paProps.accordionId)).toBeTruthy();
  });


  test('lists permissions', async () => {
    renderPermissionsAccordion({
      form: {
        getFieldState: () => ({
          value: [
            { name: 'foo', visible: true },
            { name: 'bar', visible: false },
          ]
        }),
      },
    });

    expect(screen.getByTestId(paProps.accordionId)).toBeTruthy();
  });

  test('without credentials, renders nothing', async () => {
    renderPermissionsAccordion({
      permToRead: 'funky-chicken',
      stripes: {
        hasPerm: (p) => p === paProps.permToRead
      },
    });

    expect(screen.queryByTestId(paProps.accordionId)).not.toBeInTheDocument();
  });

  test('without credentials, hides add-permission button', async () => {
    IfPermission.mockImplementation(({ perm, children }) => {
      return (perm === paProps.permToModify) ? children : null;
    });

    renderPermissionsAccordion({
      permToModify: 'funky-chicken'
    });

    expect(screen.queryByText('ui-users.permissions.addPermission')).not.toBeInTheDocument();
  });

  describe('with credentials', () => {
    test('shows add-permission button', async () => {
      IfPermission.mockImplementation(({ perm, children }) => {
        return (perm === paProps.permToModify) ? children : null;
      });

      renderPermissionsAccordion();

      expect(screen.getByText('ui-users.permissions.addPermission')).toBeInTheDocument();
    });

    describe('when only "visible: true" permissions are assigned', () => {
      test('shows permissions-dialog', async () => {
        renderPermissionsAccordion();

        expect(screen.queryByText('PermissionsModal')).not.toBeInTheDocument();
        userEvent.click(screen.getByText('ui-users.permissions.addPermission'));
        expect(await screen.findByText('PermissionsModal')).toBeInTheDocument();
      });
    });

    // NOTE: The 'visible: false permissions' tests are being skipped because the
    // confirmation modal is now being skipped in the actual code (because it's
    // not needed for the time being).
    describe.skip('when "visible: false" permissions are also assigned', () => {
      test('shows prompt', async () => {
        renderPermissionsAccordion({
          form: {
            getFieldState: () => ({
              value: [
                { name: 'foo', visible: true },
                { name: 'bar', visible: false },
              ]
            }),
          },
        });

        userEvent.click(screen.getByText('ui-users.permissions.addPermission'));
        expect(await screen.findByText('ui-users.permissions-accordion.confirm-heading')).toBeInTheDocument();
      });

      test('hides prompt on cancel', async () => {
        renderPermissionsAccordion({
          form: {
            getFieldState: () => ({
              value: [
                { name: 'foo', visible: true },
                { name: 'bar', visible: false },
              ]
            }),
          },
        });

        userEvent.click(screen.getByText('ui-users.permissions.addPermission'));
        const cancelButton = await screen.findByRole('button', { name: 'stripes-components.cancel' });
        userEvent.click(cancelButton);

        await waitForElementToBeRemoved(() => screen.getByText('ui-users.permissions-accordion.confirm-heading'));
      });

      test('shows permissions-dialog on confirm', async () => {
        renderPermissionsAccordion({
          form: {
            getFieldState: () => ({
              value: [
                { name: 'foo', visible: true },
                { name: 'bar', visible: false },
              ]
            }),
          },
        });

        // PermissionsModal is _not_ present
        expect(screen.queryByText('PermissionsModal')).not.toBeInTheDocument();

        userEvent.click(screen.getByText('ui-users.permissions.addPermission'));
        const cancelButton = await screen.findByRole('button', { name: 'ui-users.permissions-accordion.confirm-continue' });
        userEvent.click(cancelButton);

        // closes the ConfirmModal
        await waitForElementToBeRemoved(() => screen.getByText('ui-users.permissions-accordion.confirm-heading'));

        // PermissionsModal _is_ present
        expect(await screen.findByText('PermissionsModal')).toBeInTheDocument();
      });
    });

    describe('when click "Unassign all permissions" button', () => {
      test('unassign modal window should be shown', async () => {
        renderPermissionsAccordion();

        const unassignAllButton = await screen.findByRole('button', { name: 'ui-users.permissions.unassignAllPermissions' });
        userEvent.click(unassignAllButton);

        expect(await screen.findByText('ui-users.permissions.modal.unassignAll.header')).toBeInTheDocument();
      });

      describe('when confirm unassigning', () => {
        test('unassign function should be called', async () => {
          renderPermissionsAccordion({
            form: {
              getFieldState: () => ({
                value: [
                  { name: 'foo', visible: true },
                  { name: 'bar', visible: false },
                ]
              }),
              change: changeFormMock,
            },
          });

          const unassignAllButton = await screen.findByRole('button', { name: 'ui-users.permissions.unassignAllPermissions' });
          userEvent.click(unassignAllButton);

          const confirmButton = await screen.findByRole('button', { name: 'ui-users.yes' });
          userEvent.click(confirmButton);

          expect(changeFormMock).toHaveBeenCalled();
        });
      });

      describe('when cancel unassigning', () => {
        test('unassign modal window should be closed', async () => {
          renderPermissionsAccordion();

          const unassignAllButton = await screen.findByRole('button', { name: 'ui-users.permissions.unassignAllPermissions' });
          userEvent.click(unassignAllButton);

          const cancelButton = await screen.findByRole('button', { name: 'ui-users.no' });
          userEvent.click(cancelButton);

          await waitForElementToBeRemoved(() => screen.getByText('ui-users.permissions.modal.unassignAll.header'));

          expect(await screen.queryByText('ui-users.permissions.modal.unassignAll.header')).not.toBeInTheDocument();
        });
      });
    });
  });
});
