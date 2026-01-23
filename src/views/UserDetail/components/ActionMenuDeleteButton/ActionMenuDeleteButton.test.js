import React from 'react';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { IfPermission } from '@folio/stripes/core';

import ActionMenuDeleteButton from './ActionMenuDeleteButton';

describe('render ActionMenuDeleteButton', () => {
  IfPermission.mockImplementation(({ children }) => children);

  describe('renders', () => {
    test('if suppressEdit resource is empty', async () => {
      const props = {
        id: '123',
        handleDeleteClick: jest.fn(),
        onToggle: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.getByText('ui-users.details.checkDelete')).toBeTruthy();
    });

    test('if suppressEdit records array is empty', async () => {
      const props = {
        id: '123',
        suppressList: [],
        handleDeleteClick: jest.fn(),
        onToggle: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.getByText('ui-users.details.checkDelete')).toBeTruthy();
    });

    test('if suppressEdit records array does not contain match', async () => {
      const props = {
        id: '123',
        suppressList: ['456'],
        onToggle: jest.fn(),
        handleDeleteClick: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.getByText('ui-users.details.checkDelete')).toBeTruthy();
    });

    test('if suppressEdit records does not contain an array', async () => {
      const props = {
        id: '123',
        onToggle: jest.fn(),
        handleDeleteClick: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.getByText('ui-users.details.checkDelete')).toBeTruthy();
    });

    test('onclick callbacks fire', async () => {
      const props = {
        id: '123',
        onToggle: jest.fn(),
        handleDeleteClick: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);
      await userEvent.click(screen.getByText('ui-users.details.checkDelete'));

      expect(props.onToggle).toHaveBeenCalled();
      expect(props.handleDeleteClick).toHaveBeenCalled();
    });
  });

  describe('does not render', () => {
    test('if supress records value matches', async () => {
      const props = {
        id: '123',
        suppressList: ['123', '456'],
        onToggle: jest.fn(),
        handleDeleteClick: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.queryByText('ui-users.details.checkDelete')).not.toBeInTheDocument();
    });

    test('if user lacks permission', async () => {
      IfPermission.mockImplementation(() => <></>);

      const props = {
        id: '123',
        onToggle: jest.fn(),
        handleDeleteClick: jest.fn(),
      };

      render(<ActionMenuDeleteButton {...props} />);

      expect(screen.queryByText('ui-users.details.checkDelete')).not.toBeInTheDocument();
    });
  });
});
