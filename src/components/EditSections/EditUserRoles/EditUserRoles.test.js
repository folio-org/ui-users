
import React from 'react';
import { cleanup, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import renderWithRouter from 'helpers/renderWithRouter';
import {
  IfPermission,
  useStripes,
} from '@folio/stripes/core';
import { Form } from 'react-final-form';
import affiliations from 'fixtures/affiliations';
import EditUserRoles from './EditUserRoles';

import {
  useAllRolesData,
  useConsortiumTenants,
  useUserAffiliations
} from '../../../hooks';


jest.mock('../../IfConsortium', () => jest.fn(({ children }) => <>{children}</>));
jest.mock('../../IfConsortiumPermission', () => jest.fn().mockReturnValue(null));

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useAllRolesData: jest.fn(),
  useConsortiumTenants: jest.fn(),
  useUserAffiliations: jest.fn(),
}));

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useStripes: jest.fn(),
  IfPermission: jest.fn()
}));

jest.unmock('@folio/stripes/components');

const STRIPES = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
  hasInterface: jest.fn().mockReturnValue(true),
  okapi: {
    tenant: 'consortium',
  },
  user: {
    user: {
      consortium: {},
    },
  },
};

const mockInitialRoles = { 'consortium': ['1', '2'], 'college': ['3'] };

const mockAllRolesData = {
  data: {
    roles: [{ id: '1', name: 'test role' },
      { id: '2', name: 'admin role' },
      { id: '3', name: 'simple role' }
    ]
  },
  isLoading: false,
  allRolesMapStructure: new Map([
    ['1', { id: '1', name: 'test role' }],
    ['2', { id: '2', name: 'admin role' }],
    ['3', { id: '3', name: 'simple role' }]
  ]),
  isSuccess: true
};
const mockChangeFunction = jest.fn();

const mockRemoveMutator = jest.fn();

const arrayMutators = {
  concat: jest.fn(),
  move: jest.fn(),
  pop: jest.fn(),
  push: jest.fn(),
  remove: mockRemoveMutator,
  removeBatch: jest.fn(),
  shift: jest.fn(),
  swap: jest.fn(),
  unshift: jest.fn(),
  update: jest.fn()
};

const renderEditRolesAccordion = (props) => {
  const component = () => <EditUserRoles {...props} />;
  return renderWithRouter(<Form
    initialValues={{ assignedRoleIds: mockInitialRoles }}
    id="form-user"
    mutators={{
      ...arrayMutators
    }}
    render={component}
    onSubmit={jest.fn()}
  />);
};

const propsData = {
  accordionId: 'user-roles',
  form: {
    change: mockChangeFunction,
  },
  assignedRoleIds: mockInitialRoles,
  setAssignedRoleIds: jest.fn(),
  user: {
    id: '1'
  },
  setTenantId: jest.fn(),
  tenantId: 'consortium'
};

describe('EditUserRoles Component', () => {
  beforeEach(() => {
    useConsortiumTenants
      .mockClear()
      .mockReturnValue({
        tenants: affiliations.map(({ tenantId, tenantName }) => ({ id: tenantId, name: tenantName })),
        isLoading: false,
      });
    useUserAffiliations
      .mockClear()
      .mockReturnValue({ isLoading: false, affiliations });

    useStripes.mockClear().mockReturnValue(STRIPES);
    useAllRolesData.mockClear().mockReturnValue(mockAllRolesData);
    IfPermission.mockImplementation(({ children }) => children);
  });
  afterEach(cleanup);

  it('shows the list of user roles', () => {
    const { getByText, queryByText } = renderEditRolesAccordion(propsData);

    expect(getByText('test role')).toBeInTheDocument();
    expect(getByText('admin role')).toBeInTheDocument();
    expect(queryByText('simple role')).not.toBeInTheDocument();
  });

  it('shows the list of user roles when switching affiliations', () => {
    let { getByText, queryByText } = renderEditRolesAccordion(propsData);

    expect(getByText('test role')).toBeInTheDocument();
    expect(getByText('admin role')).toBeInTheDocument();
    expect(queryByText('simple role')).not.toBeInTheDocument();

    cleanup();

    ({ getByText, queryByText } = renderEditRolesAccordion({
      ...propsData,
      tenantId: 'college'
    }));

    expect(queryByText('test role')).not.toBeInTheDocument();
    expect(queryByText('admin role')).not.toBeInTheDocument();
    expect(getByText('simple role')).toBeInTheDocument();
  });

  it('hides the roles accordion when user doesn\'t have view roles permission', () => {
    IfPermission.mockImplementation(({ perm, children }) => (perm !== 'ui-authorization-roles.users.settings.view' ? children : null));
    const { queryByText } = renderEditRolesAccordion(propsData);

    expect(queryByText('ui-users.roles.userRoles')).not.toBeInTheDocument();
  });

  it('hides the add role button when user doesn\'t have manage roles permission', () => {
    IfPermission.mockImplementation(({ perm, children }) => (perm !== 'ui-authorization-roles.users.settings.manage' ? children : null));
    const { getByText, queryByText } = renderEditRolesAccordion(propsData);

    expect(getByText('test role')).toBeInTheDocument();
    expect(getByText('admin role')).toBeInTheDocument();
    expect(queryByText('ui-users.roles.addRoles')).not.toBeInTheDocument();
  });

  it('calls delete user role function', async () => {
    const id = `clickable-remove-user-role-${mockAllRolesData.data.roles[0].id}`;
    renderEditRolesAccordion(propsData);

    await waitFor(async () => {
      await userEvent.click(document.getElementById(id));
      expect(mockRemoveMutator).toHaveBeenCalledTimes(1);
    });
  });

  it('shows the roles modal on add role button click', async () => {
    const { getByTestId } = renderEditRolesAccordion(propsData);

    expect(getByTestId('add-roles-button')).toBeInTheDocument();

    await waitFor(async () => {
      await userEvent.click(getByTestId('add-roles-button'));
      expect(document.getElementById('user-roles-modal')).toBeInTheDocument();
    });
  });

  it('shows the unassignAll confirmation modal window and close it', async () => {
    const { getByTestId, getByText, queryByText } = renderEditRolesAccordion(propsData);
    const cancelConfirmationButton = document.querySelector('[data-test-confirmation-modal-cancel-button="true"]');

    await userEvent.click(getByTestId('unassign-all-roles-button'));

    expect(getByText('ui-users.roles.modal.unassignAll.label')).toBeInTheDocument();

    waitFor(async () => {
      await userEvent.click(cancelConfirmationButton);
      expect(queryByText('ui-users.roles.modal.unassignAll.label')).not.toBeInTheDocument();
    });
  });

  it('shows the unassignAll confirmation modal window and confirm it', async () => {
    const { getByTestId } = renderEditRolesAccordion(propsData);

    await userEvent.click(getByTestId('unassign-all-roles-button'));
    const confirmButton = document.querySelector('[data-test-confirmation-modal-confirm-button="true"]');
    await userEvent.click(confirmButton);

    expect(mockChangeFunction).toHaveBeenCalledWith('assignedRoleIds[consortium]', []);
  });
});
