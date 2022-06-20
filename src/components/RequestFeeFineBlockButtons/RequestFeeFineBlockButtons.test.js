import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import {
  BrowserRouter as Router,
} from 'react-router-dom';

import { IfPermission } from '@folio/stripes/core';

import '__mock__/stripesCore.mock';

import RequestFeeFineBlockButtons from './RequestFeeFineBlockButtons';

const props = {
  onToggle: jest.fn(),
  userId: '1',
  barcode: '12345',
};

const renderRequestFeeFineBlockButtons = (extraProps = {}) => render(
  <Router>
    <RequestFeeFineBlockButtons {...props} {...extraProps} />
  </Router>
);

describe('RequestFeeFineBlockButtons', () => {
  describe('with all permissions', () => {
    beforeEach(() => {
      IfPermission.mockImplementation(({ _, children }) => children);
    });

    it('renders all buttons', () => {
      renderRequestFeeFineBlockButtons();
      expect(screen.queryByText('ui-users.requests.createRequest')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.accounts.chargeManual')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.blocks.buttons.add')).toBeInTheDocument();
    });

    it('renders all buttons when barcode is empty', () => {
      renderRequestFeeFineBlockButtons({ barcode: null });
      expect(screen.queryByText('ui-users.requests.createRequest')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.accounts.chargeManual')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.blocks.buttons.add')).toBeInTheDocument();
    });
  });

  describe('without ui-requests.all permission', () => {
    beforeEach(() => {
      IfPermission.mockImplementation(({ perm, children }) => (perm !== 'ui-requests.all' ? children : null));
    });

    it('renders all buttons without createRequest button', () => {
      renderRequestFeeFineBlockButtons();
      expect(screen.queryByText('ui-users.requests.createRequest')).not.toBeInTheDocument();
      expect(screen.queryByText('ui-users.accounts.chargeManual')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.blocks.buttons.add')).toBeInTheDocument();
    });
  });

  describe('without ui-users.feesfines.actions.all permission', () => {
    beforeEach(() => {
      IfPermission.mockImplementation(({ perm, children }) => (perm !== 'ui-users.feesfines.actions.all' ? children : null));
    });

    it('renders buttons without chargeManual button', () => {
      renderRequestFeeFineBlockButtons();
      expect(screen.queryByText('ui-users.requests.createRequest')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.accounts.chargeManual')).not.toBeInTheDocument();
      expect(screen.queryByText('ui-users.blocks.buttons.add')).toBeInTheDocument();
    });
  });

  describe('without ui-users.feesfines.actions.all permission', () => {
    beforeEach(() => {
      IfPermission.mockImplementation(({ perm, children }) => (perm !== 'ui-users.patron_blocks' ? children : null));
    });

    it('renders buttons without add button', () => {
      renderRequestFeeFineBlockButtons();
      expect(screen.queryByText('ui-users.requests.createRequest')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.accounts.chargeManual')).toBeInTheDocument();
      expect(screen.queryByText('ui-users.blocks.buttons.add')).not.toBeInTheDocument();
    });
  });
});
