import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { screen } from '@folio/jest-config-stripes/testing-library/react';

import '__mock__/matchMedia.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import affiliations from 'fixtures/affiliations';
import roles from 'fixtures/roles';
import {
  useUserAffiliations,
  useUserTenantRoles,
} from '../../../hooks';
import IfConsortiumPermission from '../../IfConsortiumPermission';
import UserRoles from './UserRoles';

jest.unmock('@folio/stripes/components');
jest.mock('../../../hooks', () => ({
  useUserAffiliations: jest.fn(),
  useUserTenantRoles: jest.fn(),
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
  accordionId: 'assignedRoles',
  expanded: true,
  onToggle: jest.fn(),
  heading: <div>User roles</div>,
  permToRead: 'perms.permissions.get',
  intl: {},
  stripes: STRIPES,
  user: {},
};

const renderUserRoles = (props = {}) => renderWithRouter(
  <UserRoles
    {...defaultProps}
    {...props}
  />
);

describe('UserRoles component', () => {
  beforeEach(() => {
    useUserAffiliations.mockClear().mockReturnValue({ isFetching: false, affiliations });
    useUserTenantRoles.mockClear().mockImplementation(({ tenantId }) => ({
      isFetching: false,
      userRoles: tenantId === 'diku' ? roles : [],
    }));
  });

  it('should render user roles accordion', () => {
    IfConsortiumPermission.mockReturnValue(null);
    renderUserRoles();

    expect(screen.getByText('ui-users.roles.userRoles')).toBeInTheDocument();
    expect(screen.getByText('funky')).toBeInTheDocument();
    expect(screen.getByText('chicken')).toBeInTheDocument();
  });

  // describe('Consortia', () => {
  //   it('should update roles list after selecting another affiliation', async () => {
  //     IfConsortiumPermission.mockImplementation(({ children }) => children);
  //     renderUserRoles();

  //     expect(screen.getByText('funky')).toBeInTheDocument();
  //     expect(screen.getByText('chicken')).toBeInTheDocument();

  //     await userEvent.click(screen.getByText(affiliations[1].tenantName));

  //     expect(screen.getByText('funky')).not.toBeInTheDocument();
  //     expect(screen.getByText('chicken')).not.toBeInTheDocument();
  //     expect(screen.getByText('ui-users.roles.empty')).toBeInTheDocument();
  //   });
  // });
});
