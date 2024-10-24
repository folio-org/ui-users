import { screen } from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';

import {
  usePatronGroups,
  useUsersQuery,
} from '../../hooks';
import PatronPreRegistrationRecordsDuplicates from './PatronPreRegistrationRecordsDuplicates';

jest.unmock('@folio/stripes/components');

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  usePatronGroups: jest.fn(),
  useStagingUserMutation: jest.fn(() => ({ mergeOrCreateUser: jest.fn() })),
  useUsersQuery: jest.fn(),
}));

const renderComponent = (props) => renderWithRouter(
  <PatronPreRegistrationRecordsDuplicates {...props} />
);

describe('PatronsPreRegistrationListContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePatronGroups.mockReturnValue({
      patronGroups: [{
        id: '3684a786-6671-4268-8ed0-9db82ebca60b',
        group: 'test',
      }],
    });
    useUsersQuery.mockReturnValue({
      users: [{
        active: true,
        personal: {
          firstName: 'John',
          lastName: 'Galt',
          email: 'ex@mp.le'
        },
        username: 'test',
        type: 'patron',
        patronGroup: '3684a786-6671-4268-8ed0-9db82ebca60b',
        barcode: '123456789',
      }],
    });
  });

  it('should render component', () => {
    renderComponent();

    expect(screen.getByText('ui-users.stagingRecords.duplicates.results.paneTitle')).toBeInTheDocument();
  });
});
