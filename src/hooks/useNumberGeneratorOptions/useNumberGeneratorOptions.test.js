import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import {
  NUMBER_GENERATOR_OPTIONS_ON_EDITABLE,
  NUMBER_GENERATOR_SETTINGS_KEY,
  NUMBER_GENERATOR_SETTINGS_SCOPE,
} from '../../settings/NumberGeneratorSettings/constants';
import { useNumberGeneratorOptions } from '..';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const NUMBER_GENERATOR = {
  barcode: NUMBER_GENERATOR_OPTIONS_ON_EDITABLE,
};

const mockData = {
  id: '8cc688c4-e7da-438e-98a7-d101cad104f4',
  key: NUMBER_GENERATOR_SETTINGS_KEY,
  scope: NUMBER_GENERATOR_SETTINGS_SCOPE,
  value: NUMBER_GENERATOR,
};

describe('useNumberGeneratorOptions', () => {
  beforeEach(() => {
    useOkapiKy
      .mockClear()
      .mockReturnValue({
        get: () => ({
          json: () => Promise.resolve({ items: [mockData] }),
        }),
      });
  });

  it('should fetch and normalize number generator options', async () => {
    const { result } = renderHook(() => useNumberGeneratorOptions(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(result.current).toEqual(expect.objectContaining({
      isLoading: false,
      data: NUMBER_GENERATOR,
    }));
  });
});
