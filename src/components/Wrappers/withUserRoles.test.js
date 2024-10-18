import React from 'react';
import { cleanup, render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes, useOkapiKy } from '@folio/stripes/core';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import withUserRoles from './withUserRoles';
import { useAllRolesData } from '../../hooks';

jest.mock('@folio/stripes/core', () => ({
  useCallout: jest.fn(() => ({ sendCallout: jest.fn() })),
  useStripes: jest.fn(),
  useOkapiKy: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  useCreateAuthUserKeycloak: jest.fn(() => ({
    mutateAsync: jest.fn()
  })),
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
    get: jest.fn().mockImplementationOnce(() => ({
      json: () => Promise.resolve({ userRoles: [{ roleId: 'role1' }, { roleId: 'role2' }] }),
    })).mockImplementationOnce(() => Promise.resolve(true)),
    put: jest.fn(() => ({
      json: () => Promise.resolve(),
    })),
  }),
};

const WrappedComponent = ({ assignedRoleIds,
  setAssignedRoleIds,
  checkAndHandleKeycloakAuthUser,
  closeKeycloakConfirmationDialog, confirmCreateKeycloakUser }) => (
    <div data-testid="assigned-role-ids">{assignedRoleIds.join(', ')}
      <button
        type="submit"
        data-testid="submit-form"
        onClick={() => checkAndHandleKeycloakAuthUser(() => {
        })}
      >Submit
      </button>
      <button type="button" onClick={() => setAssignedRoleIds([5, 6, 7])} data-testid="assignRoles" id="cancel">Assign roles</button>
      <div data-testid="confirmation-dialog">
        <button
          type="button"
          data-testid="confirm-create-keycloak-user"
          onClick={() => confirmCreateKeycloakUser(() => {
          })}
        >Confirm
        </button>
        <button type="button" onClick={closeKeycloakConfirmationDialog} data-testid="cancel" id="cancel">Cancel</button>
      </div>
    </div>
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
    const { getByTestId } = render(<ComponentWithUserRoles match={{ params: { id: 'user1' } }} stripes={{ hasInterface: jest.fn().mockReturnValue(true) }} />);

    await waitFor(() => expect(getByTestId('assigned-role-ids')).toHaveTextContent('role1, role2'));
  });

  it('check keycloak user', async () => {
    const ComponentWithUserRoles = withUserRoles(WrappedComponent);
    const { getByTestId } = render(<ComponentWithUserRoles match={{ params: { id: 'user1' } }} stripes={{ hasInterface: jest.fn().mockReturnValue(true) }} />);

    await userEvent.click(getByTestId('submit-form'));
  });

  it('close confirmation dialog', async () => {
    const ComponentWithUserRoles = withUserRoles(WrappedComponent);
    const { getByTestId } = render(<ComponentWithUserRoles match={{ params: { id: 'user1' } }} stripes={{ hasInterface: jest.fn().mockReturnValue(true) }} />);

    await userEvent.click(getByTestId('cancel'));
  });

  it('submit form changing user role ids and cancel confirmation dialog', async () => {
    const ComponentWithUserRoles = withUserRoles(WrappedComponent);
    const { getByTestId } = render(<ComponentWithUserRoles match={{ params: { id: 'user1' } }} stripes={{ hasInterface: jest.fn().mockReturnValue(true) }} />);

    await userEvent.click(getByTestId('assignRoles'));
    await userEvent.click(getByTestId('submit-form'));
    await userEvent.click(getByTestId('cancel'));
  });

  it('submit form after changing user role ids', async () => {
    const ComponentWithUserRoles = withUserRoles(WrappedComponent);
    const { getByTestId } = render(<ComponentWithUserRoles match={{ params: { id: 'user1' } }} stripes={{ hasInterface: jest.fn().mockReturnValue(true) }} />);

    await userEvent.click(getByTestId('assignRoles'));
    await userEvent.click(getByTestId('confirm-create-keycloak-user'));
  });
});
