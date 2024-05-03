
import React from 'react';
import { cleanup } from '@folio/jest-config-stripes/testing-library/react';
import renderWithRouter from 'helpers/renderWithRouter';
import {
  useStripes,
} from '@folio/stripes/core';
import EditUserRoles from './EditUserRoles';

import { useAllRolesData, useUserTenantRoles } from '../../../hooks';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useUserTenantRoles: jest.fn(),
  useAllRolesData: jest.fn()
}));

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useStripes: jest.fn(),
}));

jest.unmock('@folio/stripes/components');


const STRIPES = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
  okapi: {
    tenant: 'diku',
  },
  user: {
    user: {
      consortium: {},
    },
  },
};

const mockAllRolesData = {
  data: {
    roles: [{ id: '1', name: 'test role' },
      { id: '2', name: 'admin role' },
      { id: '3', name: 'simple role' }
    ]
  },
};

const renderEditRolesAccordion = () => renderWithRouter(<EditUserRoles accordionId="user-roles" assignedRoleIds={['1', '2']} />);

describe('EditUserRoles Component', () => {
  beforeEach(() => {
    useStripes.mockClear().mockReturnValue(STRIPES);
    useAllRolesData.mockClear().mockReturnValue(mockAllRolesData);
    useUserTenantRoles.mockClear().mockReturnValue({
      isFetching: false,
      userRoles: [{ id: '1', name: 'test role' },
        { id: '2', name: 'admin role' }
      ]
    });
  });
  afterEach(cleanup);

  it('shows the list of user roles', () => {
    const { getByText, queryByText } = renderEditRolesAccordion();

    expect(getByText('test role')).toBeInTheDocument();
    expect(getByText('admin role')).toBeInTheDocument();
    expect(queryByText('simple role')).not.toBeInTheDocument();
  });
});
