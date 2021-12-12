import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IfPermission } from '@folio/stripes/core';

import '__mock__/reactFinalFormArrays.mock';
import '__mock__/intl.mock';

import PermissionsAccordion from './PermissionsAccordion';

jest.unmock('@folio/stripes/components');

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
  return () => <div>PermissionsModal</div>;
});


// if (!this.props.stripes.hasPerm(this.props.permToRead)) return null;

// const renderPermissionsAccordion = (extraProps = {}) => (
//   render(<Form
//     onSubmit={jest.fn()}
//     mutators={{ ...arrayMutators }}
//     render={props => (
//       <PermissionsAccordion {...props} {...paProps} {...extraProps} />
//     )}
//   />)
// );

const renderPermissionsAccordion = (extraProps = {}) => render(<PermissionsAccordion {...paProps} {...extraProps} />);

describe('PermissionsAccordion', () => {
  test('lists permissions', async () => {
    renderPermissionsAccordion({
      stripes: {
        hasPerm: (p) => p === paProps.permToRead
      },
    });

    expect(screen.queryByTestId(paProps.accordionId)).toBeTruthy();
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

    expect(screen.queryByTestId(paProps.accordionId)).toBeTruthy();
  });

  test('without credentials, renders nothing', async () => {
    renderPermissionsAccordion({
      permToRead: 'funky-chicken',
      stripes: {
        hasPerm: (p) => p === paProps.permToRead
      },
    });

    expect(screen.queryByTestId(paProps.accordionId)).toBeFalsy();
  });

  test('without credentials, hides add-permission button', async () => {
    IfPermission.mockImplementation(({ perm, children }) => {
      return (perm === paProps.permToModify) ? children : null;
    });

    renderPermissionsAccordion({
      permToModify: 'funky-chicken'
    });

    expect(screen.queryByText('ui-users.permissions.addPermission')).toBeFalsy();
  });

  describe('with credentials', () => {
    test('shows add-permission button', async () => {
      IfPermission.mockImplementation(({ perm, children }) => {
        return (perm === paProps.permToModify) ? children : null;
      });

      renderPermissionsAccordion();

      expect(screen.queryByText('ui-users.permissions.addPermission')).toBeTruthy();
    });

    describe('when only "visible: true" permissions are assigned', () => {
      test('shows permissions-dialog', async () => {
        renderPermissionsAccordion();

        userEvent.click(screen.getByText('ui-users.permissions.addPermission'));
        expect(screen.getByText('PermissionsModal')).toBeTruthy();
      });
    });

    describe('when "visible: false" permissions are also assigned', () => {
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
        expect(screen.getByText('ui-users.permissions-accordion.confirm-heading')).toBeTruthy();
      });

      test.skip('hides prompt on cancel', async () => {
        renderPermissionsAccordion();

        expect(screen.queryByText('ui-users.brd.successfulRenewal')).toBeInTheDocument();
      });

      test.skip('shows permissions-dialog on confirm', async () => {
        renderPermissionsAccordion();

        expect(screen.queryByText('ui-users.brd.successfulRenewal')).toBeInTheDocument();
      });
    });
  });
});
