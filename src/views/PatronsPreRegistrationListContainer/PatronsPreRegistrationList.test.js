import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';

import preRegistrationRecords from 'fixtures/preRegistrationRecords';

import { MultiColumnList } from '@folio/stripes/components';

import { useUserDuplicatesCheck } from './hooks';
import PatronsPreRegistrationList from './PatronsPreRegistrationList';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ search: '' }),
}));

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useUserDuplicatesCheck: jest.fn(),
}));

const defaultProps = {
  data: [],
  isEmptyMessage: 'empty message',
  totalCount: 0,
  onNeedMoreData: jest.fn(),
};

const handleDuplicationsCheck = jest.fn(() => ({
  checkDuplicates: () => false,
}));

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const renderComponent = (props = {}) => render(
  <PatronsPreRegistrationList
    {...defaultProps}
    {...props}
  />,
  { wrapper },
);

describe('PatronsPreRegistrationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserDuplicatesCheck.mockReturnValue({ handle: handleDuplicationsCheck });
  });

  it('should render the component', () => {
    renderComponent();

    expect(screen.getByTestId('PatronsPreRegistrationsList')).toBeVisible();
  });

  it('should be called with correct props', () => {
    const expectedProps = {
      autosize: true,
      contentData: preRegistrationRecords,
      id: 'PatronsPreRegistrationsList',
      pageAmount: 100,
      pagingType: 'prev-next',
      totalCount: 1,
      columnMapping: expect.any(Object),
      formatter: expect.any(Object),
    };
    const props = {
      ...defaultProps,
      totalCount: 1,
      data: preRegistrationRecords,
    };

    renderComponent(props);
    expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });
});
