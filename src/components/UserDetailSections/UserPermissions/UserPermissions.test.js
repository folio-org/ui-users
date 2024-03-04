import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { screen } from '@folio/jest-config-stripes/testing-library/react';

import '__mock__/matchMedia.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import affiliations from 'fixtures/affiliations';
import permissions from 'fixtures/permissions';
import {
  useUserAffiliations,
  useUserTenantPermissions,
} from '../../../hooks';
import IfConsortiumPermission from '../../IfConsortiumPermission';
import UserPermissions from './UserPermissions';

jest.unmock('@folio/stripes/components');
jest.mock('../../../hooks', () => ({
  useUserAffiliations: jest.fn(),
  useUserTenantPermissions: jest.fn(),
}));
jest.mock('../../IfConsortium', () => jest.fn(({ children }) => <>{children}</>));
jest.mock('../../IfConsortiumPermission', () => jest.fn());

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

const defaultProps = {
  accordionId: 'assignedPermissions',
  expanded: true,
  onToggle: jest.fn(),
  heading: <div>User Permissions</div>,
  permToRead: 'perms.permissions.get',
  intl: {},
  stripes: STRIPES,
  user: {},
};

const renderUserPermissions = (props = {}) => renderWithRouter(
  <UserPermissions
    {...defaultProps}
    {...props}
  />
);

describe('UserPermissions component', () => {
  beforeEach(() => {
    useUserAffiliations.mockClear().mockReturnValue({ isFetching: false, affiliations });
    useUserTenantPermissions.mockClear().mockImplementation(({ tenantId }) => ({
      isFetching: false,
      userPermissions: tenantId === 'diku' ? permissions : [],
    }));
  });

  it('should render user permissions accordion', () => {
    IfConsortiumPermission.mockReturnValue(null);
    renderUserPermissions();

    expect(screen.getByText('ui-users.permissions.userPermissions')).toBeInTheDocument();
    expect(screen.getByText('ui-agreements.permission.agreements.edit')).toBeInTheDocument();
    expect(screen.getByText('ui-agreements.permission.agreements.delete')).toBeInTheDocument();
  });

  describe('Consortia', () => {
    it('should update permissions list after selecting another affiliation', async () => {
      IfConsortiumPermission.mockImplementation(({ children }) => children);
      renderUserPermissions();

      expect(screen.getByText('ui-agreements.permission.agreements.edit')).toBeInTheDocument();
      expect(screen.getByText('ui-agreements.permission.agreements.delete')).toBeInTheDocument();

      await userEvent.click(screen.getByText(affiliations[1].tenantName));

      expect(screen.queryByText('ui-agreements.permission.agreements.edit')).not.toBeInTheDocument();
      expect(screen.queryByText('ui-agreements.permission.agreements.delete')).not.toBeInTheDocument();
    });
  });
});
