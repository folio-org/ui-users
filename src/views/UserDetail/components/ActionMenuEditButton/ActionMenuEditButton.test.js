import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IfPermission } from '@folio/stripes/core';

import ActionMenuEditButton from './ActionMenuEditButton';

describe('render ActionMenuEditOption', () => {
  IfPermission.mockImplementation(({ children }) => children);

  describe('renders', () => {
    test('if suppressList resource is empty', async () => {
      const props = {
        id: '123',
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
        shouldSuppress: jest.fn(),
      };

      render(<ActionMenuEditButton {...props} />);

      expect(screen.getByText('ui-users.edit')).toBeTruthy();
    });

    test('if suppressList records array is empty', async () => {
      const props = {
        id: '123',
        suppressList: { records: [] },
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
        shouldSuppress: jest.fn(),
      };

      render(<ActionMenuEditButton {...props} />);

      expect(screen.getByText('ui-users.edit')).toBeTruthy();
    });

    test('if suppressList records array does not contain match', async () => {
      const props = {
        id: '123',
        suppressList: { records: [{ value: '["456"]' }] },
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
        shouldSuppress: jest.fn(),
      };

      render(<ActionMenuEditButton {...props} />);

      expect(screen.getByText('ui-users.edit')).toBeTruthy();
    });

    test('if suppressList records does not contain an array', async () => {
      const props = {
        id: '123',
        suppressList: { records: [{ value: '{"monkey": "bagel"}' }] },
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
        shouldSuppress: jest.fn(),
      };

      render(<ActionMenuEditButton {...props} />);

      expect(screen.getByText('ui-users.edit')).toBeTruthy();
    });

    test('onclick callbacks fire', async () => {
      const props = {
        id: '123',
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
        shouldSuppress: jest.fn(),
      };

      render(<ActionMenuEditButton {...props} />);
      userEvent.click(screen.getByText('ui-users.edit'));

      expect(props.onToggle).toHaveBeenCalled();
      expect(props.goToEdit).toHaveBeenCalled();
    });
  });

  describe('does not render', () => {
    test('if supress records value matches', async () => {
      const props = {
        id: '123',
        suppressList: { records: [{ value: '["123", "456"]' }] },
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
        shouldSuppress: jest.fn(),
      };

      render(<ActionMenuEditButton {...props} />);

      expect(screen.queryByText('ui-users.edit')).not.toBeInTheDocument();
    });

    test('if user lacks permission', async () => {
      IfPermission.mockImplementation(() => <></>);

      const props = {
        id: '123',
        onToggle: jest.fn(),
        goToEdit: jest.fn(),
        editButton: jest.fn(),
        shouldSuppress: jest.fn(),
      };

      render(<ActionMenuEditButton {...props} />);

      expect(screen.queryByText('ui-users.edit')).not.toBeInTheDocument();
    });
  });
});
