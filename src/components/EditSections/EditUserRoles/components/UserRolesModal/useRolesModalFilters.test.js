import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import useRolesModalFilters from './useRolesModalFilters';

describe('useRolesModalFilters', () => {
  it('initializes filters with default state', () => {
    const { result } = renderHook(() => useRolesModalFilters());
    expect(result.current.filters).toEqual({});
  });

  it('updates filters when onChangeFilter is called', () => {
    const { result } = renderHook(() => useRolesModalFilters());
    waitFor(() => {
      result.current.onChangeFilter({ target: { name: 'filterName', checked: true } });
      expect(result.current.filters).toEqual({ filterName: true });
    });
  });

  it('clears filter when onClearFilter is called', () => {
    const { result } = renderHook(() => useRolesModalFilters());
    waitFor(() => {
      result.current.onChangeFilter({ target: { name: 'filterName', checked: true } });
      result.current.onClearFilter('filterName');
      expect(result.current.filters).toEqual({});
    });
  });

  it('resets filters to default state when resetFilters is called', () => {
    const { result } = renderHook(() => useRolesModalFilters());
    waitFor(() => {
      result.current.onChangeFilter({ target: { name: 'filterName', checked: true } });
      result.current.resetFilters();
      expect(result.current.filters).toEqual({});
    });
  });

  it('clears filters with matching filterName', () => {
    const { result } = renderHook(() => useRolesModalFilters());
    waitFor(() => {
      result.current.onChangeFilter({ target: { name: 'filterName1', checked: true } });
      result.current.onChangeFilter({ target: { name: 'filterName2', checked: true } });
      result.current.onChangeFilter({ target: { name: 'otherFilter', checked: true } });
      result.current.onClearFilter('filterName');
      expect(result.current.filters).toEqual({ otherFilter: true });
    });
  });

  it('does not modify filters if no matching filterName', () => {
    const { result } = renderHook(() => useRolesModalFilters());
    waitFor(() => {
      result.current.onChangeFilter({ target: { name: 'filterName1', checked: true } });
      result.current.onChangeFilter({ target: { name: 'filterName2', checked: true } });
      result.current.onChangeFilter({ target: { name: 'otherFilter', checked: true } });
      result.current.onClearFilter('nonexistentFilter');
      expect(result.current.filters).toEqual({ filterName1: true, filterName2: true, otherFilter: true });
    });
  });

  it('does not modify filters if no filters are present', () => {
    const { result } = renderHook(() => useRolesModalFilters());
    waitFor(() => {
      result.current.onClearFilter('filterName');
      expect(result.current.filters).toEqual({});
    });
  });
});
