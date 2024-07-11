import React from 'react';
import { cleanup, render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes, useOkapiKy } from '@folio/stripes/core';
import withUserRoles from './withUserRoles';
import { useAllRolesData } from '../../hooks';

jest.mock('@folio/stripes/core', () => ({
  useStripes: jest.fn(),
  useOkapiKy: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  useAllRolesData: jest.fn(),
}));

const mockStripes = {
  okapi: {
    tenant: 'tenant',
  },
  config: {
    maxUnpagedResourceCount: 1000,
  },
};

const mockRolesData = {
  isLoading: false,
  allRolesMapStructure: new Map([
    ['role1', { name: 'Role 1', id: 'role1' }],
    ['role2', { name: 'Role 2', id: 'role2' }],
  ]),
};

const mockKy = {
  extend: () => ({
    get: jest.fn(() => ({
      json: () => Promise.resolve({ userRoles: [{ roleId: 'role1' }, { roleId: 'role2' }] }),
    })),
    put: jest.fn(() => ({
      json: () => Promise.resolve(),
    })),
  }),
};

const WrappedComponent = ({ assignedRoleIds }) => (
  <div data-testid="assigned-role-ids">{assignedRoleIds.join(', ')}</div>
);

describe('withUserRoles HOC', () => {
  afterAll(() => {
    jest.clearAllMocks();
    cleanup();
  });
  beforeEach(() => {
    useStripes.mockReturnValue(mockStripes);
    useAllRolesData.mockReturnValue(mockRolesData);
    useOkapiKy.mockReturnValue(mockKy);
  });

  it('fetches and sets assigned role ids on mount and assignedRoleIds passed to wrapped component correctly', async () => {
    const ComponentWithUserRoles = withUserRoles(WrappedComponent);
    const { getByTestId } = render(<ComponentWithUserRoles match={{ params: { id: 'user1' } }} />);

    await waitFor(() => expect(getByTestId('assigned-role-ids')).toHaveTextContent('role1, role2'));
  });
});
