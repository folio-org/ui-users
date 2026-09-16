import { render } from '@folio/jest-config-stripes/testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { IfPermission } from '@folio/stripes/core';

import RoleNameLink from './RoleNameLink';

jest.unmock('@folio/stripes/components');

const history = createMemoryHistory();
const role = { id: '1', name: 'test role' };

const renderRoleNameLink = () => render(
  <Router history={history}>
    <RoleNameLink role={role} />
  </Router>
);

describe('RoleNameLink', () => {
  afterEach(() => {
    IfPermission.mockClear();
  });

  it('renders a link to the role detail page when the user has permission', () => {
    IfPermission.mockImplementation(({ children }) => children({ hasPermission: true }));

    const { getByText } = renderRoleNameLink();
    const link = getByText('test role');

    expect(link.closest('a')).toHaveAttribute('href', '/settings/authorization-roles/1');
  });

  it('renders plain text without a link when the user lacks permission', () => {
    IfPermission.mockImplementation(({ children }) => children({ hasPermission: false }));

    const { getByText } = renderRoleNameLink();
    const text = getByText('test role');

    expect(text.closest('a')).not.toBeInTheDocument();
  });
});
