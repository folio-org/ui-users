import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IfPermission } from '@folio/stripes/core';

import ActionMenuDeleteButton from './ActionMenuDeleteButton';

describe('render ActionMenuDeleteButton', () => {
  IfPermission.mockImplementation(({ children }) => children);

  describe('renders', () => {
    test('if suppressEdit resource is empty', async () => {
      const props = {
        id: '123',
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.getByText('ui-users.details.checkDelete')).toBeTruthy();
    });

    test('if suppressEdit records array is empty', async () => {
      const props = {
        id: '123',
        suppressEdit: { records: [] },
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.getByText('ui-users.details.checkDelete')).toBeTruthy();
    });

    test('if suppressEdit records array does not contain match', async () => {
      const props = {
        id: '123',
        suppressEdit: { records: '["456"]' },
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.getByText('ui-users.details.checkDelete')).toBeTruthy();
    });

    test('onclick callbacks fire', async () => {
      const props = {
        id: '123',
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);
      userEvent.click(screen.getByText('ui-users.details.checkDelete'));

      expect(props.onToggle).toHaveBeenCalled();
      expect(props.goToEdit).toHaveBeenCalled();
    });

    describe('logs error on invalid JSON', () => {
      beforeAll(() => {
        // eslint-disable-next-line no-console
        console.error = jest.fn();
      });
      afterAll(() => {
        // eslint-disable-next-line no-console
        console.error.mockRestore();
      });

      test('value is incorrectly serialize', () => {
        const props = {
          id: '123',
          suppressEdit: { records: [{ value: '["123", 456"]' }] },
          onToggle: jest.fn(),
          goToEdit: jest.fn(),
          editButton: jest.fn(),
        };

        render(<ActionMenuDeleteButton {...props} />);

        // eslint-disable-next-line no-console
        expect(console.error).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('does not render', () => {
    test('if supress records value matches', async () => {
      const props = {
        id: '123',
        suppressEdit: { records: [{ value: '["123", "456"]' }] },
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.queryByText('ui-users.details.checkDelete')).not.toBeInTheDocument();
    });

    test('if user lacks permission', async () => {
      IfPermission.mockImplementation(() => <></>);

      const props = {
        id: '123',
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.queryByText('ui-users.details.checkDelete')).not.toBeInTheDocument();
    });
  });
});
