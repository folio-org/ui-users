import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react-hooks';

import { SORT_DIRECTIONS } from '../../constants';
import useSortingMCL from './useSortingMCL';

const sortableColumns = ['name', 'status'];

describe('useSortingMCL', () => {
  it('should manage sorting state for MCL', async () => {
    const { result } = renderHook(() => useSortingMCL(sortableColumns));

    await act(async () => result.current.changeSorting({}, { name: sortableColumns[0] }));

    expect(result.current.sortDirection).toEqual(SORT_DIRECTIONS.asc);
    expect(result.current.sortOrder).toEqual(sortableColumns[0]);

    await act(async () => result.current.changeSorting({}, { name: sortableColumns[0] }));

    expect(result.current.sortDirection).toEqual(SORT_DIRECTIONS.desc);
    expect(result.current.sortOrder).toEqual(sortableColumns[0]);

    await act(async () => result.current.changeSorting({}, { name: sortableColumns[1] }));

    expect(result.current.sortDirection).toEqual(SORT_DIRECTIONS.asc);
    expect(result.current.sortOrder).toEqual(sortableColumns[1]);
  });
});
