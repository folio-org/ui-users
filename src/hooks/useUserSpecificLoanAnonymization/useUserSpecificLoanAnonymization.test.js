import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import useUserSpecificLoanAnonymization from './useUserSpecificLoanAnonymization';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

// Spread instead of default parameters, so that an explicit undefined (e.g. permissions not loaded yet) is kept
const mockStripes = (overrides = {}) => {
  const { hasInterface, hasPerm } = { hasInterface: true, hasPerm: true, ...overrides };

  useStripes.mockReturnValue({
    hasInterface: jest.fn(() => hasInterface),
    hasPerm: jest.fn(() => hasPerm),
  });
};

const mockSettingResponse = (getResponse) => {
  const get = jest.fn(() => ({ json: getResponse }));

  useOkapiKy.mockReturnValue({ get });

  return get;
};

const loanHistory = userSpecific => ({
  circulationSettings: [{
    id: 'setting-id',
    name: 'loan_history',
    value: { closingType: { loan: 'interval', userSpecific } },
  }],
  totalRecords: 1,
});

const renderUseUserSpecificLoanAnonymization = async () => {
  const { result } = renderHook(() => useUserSpecificLoanAnonymization(), { wrapper });

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  return result.current;
};

describe('useUserSpecificLoanAnonymization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    mockStripes();
  });

  it('should query the loan_history circulation setting', async () => {
    const get = mockSettingResponse(() => Promise.resolve(loanHistory('immediately')));

    await renderUseUserSpecificLoanAnonymization();

    expect(get).toHaveBeenCalledWith('circulation/settings', {
      searchParams: { query: 'name==loan_history' },
    });
  });

  it.each(['immediately', 'interval'])('should be enabled when userSpecific is %s', async (userSpecific) => {
    mockSettingResponse(() => Promise.resolve(loanHistory(userSpecific)));

    const { isEnabled } = await renderUseUserSpecificLoanAnonymization();

    expect(isEnabled).toBe(true);
  });

  it.each([
    ['userSpecific is disabled', loanHistory('disabled')],
    ['userSpecific is missing', loanHistory(undefined)],
    ['the setting does not exist', { circulationSettings: [], totalRecords: 0 }],
  ])('should be disabled when %s', async (_, response) => {
    mockSettingResponse(() => Promise.resolve(response));

    const { isEnabled } = await renderUseUserSpecificLoanAnonymization();

    expect(isEnabled).toBe(false);
  });

  it('should be disabled when the request fails', async () => {
    mockSettingResponse(() => Promise.reject(new Error('Forbidden')));

    const { isEnabled } = await renderUseUserSpecificLoanAnonymization();

    expect(isEnabled).toBe(false);
  });

  it.each([
    ['the circulation-settings interface is missing', { hasInterface: false }],
    ['the staff user may not read circulation settings', { hasPerm: false }],
    ['the staff user permissions are not loaded yet', { hasPerm: undefined }],
  ])('should be disabled without a request when %s', async (_, stripes) => {
    mockStripes(stripes);
    const get = mockSettingResponse(() => Promise.resolve(loanHistory('immediately')));

    const { isEnabled } = await renderUseUserSpecificLoanAnonymization();

    expect(isEnabled).toBe(false);
    expect(get).not.toHaveBeenCalled();
  });
});
