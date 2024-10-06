import { renderHook } from '@testing-library/react-hooks';
import { useNamespace, useOkapiKy } from '@folio/stripes/core';
import { useQuery } from 'react-query';

import useStaffSlips from './useStaffSlips';

jest.mock('@folio/stripes/core', () => ({
  useNamespace: jest.fn(),
  useOkapiKy: jest.fn(),
}));

jest.mock('react-query', () => ({
  useQuery: jest.fn(),
}));

describe('useStaffSlips', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNamespace.mockReturnValue(['test-namespace']);
    useOkapiKy.mockReturnValue({
      json: jest.fn(),
    });
  });

  it('should return loading state when query is fetching', () => {
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    });

    const { result } = renderHook(() => useStaffSlips());

    expect(result.current).toEqual({
      staffSlips: [],
      isLoading: true,
      isSuccess: false,
    });
  });

  it('should return staff slips data when query is successful', () => {
    const mockData = {
      staffSlips: [
        { id: '1', name: 'Due date receipt', template: '<p>Template 1</p>' },
        { id: '2', name: 'Hold slip', template: '<p>Template 2</p>' },
      ],
    };

    useQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isSuccess: true,
    });

    const { result } = renderHook(() => useStaffSlips());

    expect(result.current).toEqual({
      staffSlips: mockData.staffSlips,
      isLoading: false,
      isSuccess: true,
    });
  });

  it('should return an empty array if there is no staff slip data', () => {
    useQuery.mockReturnValue({
      data: { staffSlips: [] },
      isLoading: false,
      isSuccess: true,
    });

    const { result } = renderHook(() => useStaffSlips());

    expect(result.current).toEqual({
      staffSlips: [],
      isLoading: false,
      isSuccess: true,
    });
  });
});
