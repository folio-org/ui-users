import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { useStripes } from '@folio/stripes/core';

import { useIsAuditEnabled } from '../../../../hooks/useAuditSettingsQuery';
import UserVersionHistoryButton from './UserVersionHistoryButton';

jest.mock('../../../../hooks/useAuditSettingsQuery', () => ({
  __esModule: true,
  default: jest.fn(),
  useIsAuditEnabled: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui) => render(
  <QueryClientProvider client={queryClient}>
    {ui}
  </QueryClientProvider>,
);

describe('UserVersionHistoryButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    useIsAuditEnabled.mockReturnValue({ isEnabled: true, isLoading: false });
  });

  it('should render button when audit is enabled', () => {
    renderWithProviders(
      <UserVersionHistoryButton onClick={jest.fn()} />,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render nothing while audit settings are loading', () => {
    useIsAuditEnabled.mockReturnValue({ isEnabled: false, isLoading: true });

    const { container } = renderWithProviders(
      <UserVersionHistoryButton onClick={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when audit is disabled', () => {
    useIsAuditEnabled.mockReturnValue({ isEnabled: false, isLoading: false });

    const { container } = renderWithProviders(
      <UserVersionHistoryButton onClick={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when user lacks versionHistory.view permission', () => {
    const stripes = useStripes();

    stripes.hasPerm.mockReturnValue(false);

    const { container } = renderWithProviders(
      <UserVersionHistoryButton onClick={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
    stripes.hasPerm.mockReturnValue(true);
  });
});
