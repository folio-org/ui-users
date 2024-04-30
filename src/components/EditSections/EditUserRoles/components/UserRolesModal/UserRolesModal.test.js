import { cleanup, render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import UserRolesModal from './UserRolesModal';
import { useUserRoles } from '../../../../../hooks';

jest.mock('../../../../../hooks', () => {
  return { ...jest.requireActual('../../../../../hooks'),
    useUserRoles: jest.fn().mockReturnValue({ data:{ roles: [{ id: '1', name: 'testRole' }] } }) };
});

jest.mock('../SearchForm/SearchForm', () => ({
  ...jest.requireActual('../SearchForm/SearchForm'),
  __esModule: true,
  default: jest.fn().mockReturnValue('Search form'),
}));

jest.unmock('@folio/stripes/components');

const renderComponent = (props = {}) => render(<div><UserRolesModal {...props} /></div>);

describe('UserRoleModal', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  it('renders user roles modal', async () => {
    const { getByText } = await waitFor(() => renderComponent({ isOpen: true, onClose: jest.fn(), assignedRoles: [{ id: '1', name: 'testRole' }, { id: '2', name: 'testRole2' }] }));

    expect(getByText('Search form')).toBeInTheDocument();
    expect(getByText('testRole')).toBeInTheDocument();
  });
});
