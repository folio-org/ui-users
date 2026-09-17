import { screen } from '@folio/jest-config-stripes/testing-library/react';

import '__mock__/matchMedia.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import { useNonRoleUserCapabilities } from '../../../hooks';
import UserCapabilities from './UserCapabilities';

jest.unmock('@folio/stripes/components');
jest.mock('../../../hooks', () => ({
  useNonRoleUserCapabilities: jest.fn(),
}));

const STRIPES = {
  okapi: {
    tenant: 'diku',
  },
};

const defaultProps = {
  accordionId: 'capabilitiesSection',
  expanded: true,
  onToggle: jest.fn(),
  stripes: STRIPES,
};

const groupedNonRoleUserCapabilitiesByType = {
  data: [
    {
      id: 'user-only-capability-id',
      applicationId: 'app-platform-minimal',
      resource: 'Users',
      actions: { view: 'user-only-capability-id' },
    },
  ],
  procedural: [],
  settings: [],
};

const renderUserCapabilities = (props = {}) => renderWithRouter(
  <UserCapabilities
    {...defaultProps}
    {...props}
  />
);

describe('UserCapabilities component', () => {
  beforeEach(() => {
    useNonRoleUserCapabilities.mockClear().mockReturnValue({
      isLoading: false,
      capabilitiesTotalCount: 1,
      groupedNonRoleUserCapabilitiesByType,
    });
  });

  it('should render the user capabilities accordion', () => {
    renderUserCapabilities();

    expect(screen.getByText('ui-users.capabilities.userCapabilities')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('should render an empty message when the user has no capabilities outside their roles', () => {
    useNonRoleUserCapabilities.mockReturnValue({
      isLoading: false,
      capabilitiesTotalCount: 0,
      groupedNonRoleUserCapabilitiesByType: { data: [], procedural: [], settings: [] },
    });

    renderUserCapabilities();

    expect(screen.getByText('ui-users.capabilities.empty')).toBeInTheDocument();
  });

  it('should render a badge with a zero count instead of spinning forever when the request fails', () => {
    useNonRoleUserCapabilities.mockReturnValue({
      isLoading: false,
      capabilitiesTotalCount: 0,
      groupedNonRoleUserCapabilitiesByType: { data: [], procedural: [], settings: [] },
    });

    renderUserCapabilities({ expanded: false });

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
