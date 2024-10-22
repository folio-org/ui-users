import {
  useHistory,
  useLocation,
} from 'react-router-dom';

import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import {
  usePatronGroups,
  useStagingUsersQuery,
  useUsersQuery,
} from '../hooks';
import { PatronPreRegistrationRecordsDuplicatesPage } from './PatronPreRegistrationRecordsDuplicatesPage';

jest.unmock('@folio/stripes/components');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useLocation: jest.fn(),
}));
jest.mock('react-virtualized-auto-sizer', () => ({ children }) => children({ height: 500, width: 500 }));
jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  usePatronGroups: jest.fn(),
  useStagingUsersQuery: jest.fn(),
  useUsersQuery: jest.fn(),
}));

const renderComponent = (props = {}) => renderWithRouter(
  <PatronPreRegistrationRecordsDuplicatesPage
    {...props}
  />
);


describe('PatronPreRegistrationRecordsDuplicatesPage', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useHistory.mockReturnValue({
      push: pushMock,
    });
    useLocation.mockReturnValue({
      search: '?email=ex@mp.le',
      state: {
        search: 'query',
      },
    });

    usePatronGroups.mockReturnValue({
      patronGroups: [{
        id: '3684a786-6671-4268-8ed0-9db82ebca60b',
        group: 'test',
      }],
    });
    useStagingUsersQuery.mockReturnValue({
      users: [{
        id: '11997fe2-785c-418f-9739-de1d08ffc84b',
        isEmailVerified: true,
        status: 'TIER-2',
        generalInfo: {
          firstName: 'John',
          lastName: 'Galt'
        },
        contactInfo: {
          email: 'ex@mp.le'
        },
      }]
    });
    useUsersQuery.mockReturnValue({
      users: [{
        active: true,
        personal: {
          firstName: 'John',
          lastName: 'Galt',
          email: 'ex@mp.le',
        },
        username: 'test',
        type: 'patron',
        patronGroup: '3684a786-6671-4268-8ed0-9db82ebca60b',
        barcode: '123456789',
      }],
    });
  });

  it('should render duplicates page', () => {
    renderComponent();

    expect(screen.getByText('ui-users.stagingRecords.duplicates.results.paneTitle')).toBeInTheDocument();
    expect(screen.getByText('ui-users.stagingRecords.duplicates.results.warning')).toBeInTheDocument();
  });

  it('should close duplicates page', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'stripes-components.closeItem' }));

    expect(pushMock).toHaveBeenCalledWith({
      pathname: '/users/pre-registration-records',
      search: 'query',
    });
  });
});
