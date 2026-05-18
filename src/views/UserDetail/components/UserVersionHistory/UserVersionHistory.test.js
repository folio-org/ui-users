import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import UserVersionHistory from './UserVersionHistory';

jest.mock('../../../../hooks/useUserAuditDataQuery', () => jest.fn(() => ({
  data: [],
  totalRecords: 0,
  isLoading: false,
  isLoadingMore: false,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
})));

jest.mock('../../../../hooks/useUserVersionHistory', () => jest.fn(() => ({
  versions: [],
  isLoading: false,
})));

jest.mock('../../../../hooks/usePatronGroups', () => jest.fn(() => ({
  patronGroups: [],
  isLoading: false,
})));

jest.mock('../../../../hooks/useDepartmentsQuery', () => jest.fn(() => ({
  departments: [],
  isLoading: false,
})));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui) => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  </QueryClientProvider>,
);

describe('UserVersionHistory', () => {
  beforeEach(() => {
    queryClient.clear();
    useCustomFieldsQuery.mockReturnValue({
      customFields: [],
      isLoadingCustomFields: false,
    });
  });

  it('should render AuditLogPane', () => {
    renderWithProviders(
      <UserVersionHistory userId="test-user-id" onClose={jest.fn()} />,
    );

    expect(screen.getByText('AuditLogPane')).toBeInTheDocument();
  });

  it('should render when custom fields with select options are present', () => {
    useCustomFieldsQuery.mockReturnValue({
      customFields: [
        {
          refId: 'customField_1',
          name: 'Department Type',
          type: 'SINGLE_SELECT_DROPDOWN',
          selectField: {
            options: {
              values: [
                { id: 'opt_0', value: 'Option A' },
                { id: 'opt_1', value: 'Option B' },
              ],
            },
          },
        },
        {
          refId: 'customField_2',
          name: 'Is Active Member',
          type: 'SINGLE_CHECKBOX',
        },
      ],
      isLoadingCustomFields: false,
    });

    renderWithProviders(
      <UserVersionHistory userId="test-user-id" onClose={jest.fn()} />,
    );

    expect(screen.getByText('AuditLogPane')).toBeInTheDocument();
  });
});

