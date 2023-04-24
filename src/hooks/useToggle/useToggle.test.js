import { act, renderHook } from '@testing-library/react-hooks';

import useToggle from './useToggle';

describe('useToggle', () => {
  it('should return value with initial state', () => {
    const { result } = renderHook(() => useToggle(true));

    const [isOpen] = result.current;

    expect(isOpen).toBeTruthy();
  });

  it('should change value to opposite when toggle is called', () => {
    const { result } = renderHook(() => useToggle(false));

    const [, toggle] = result.current;

    act(() => {
      toggle();
    });

    expect(result.current[0]).toBeTruthy();
  });
});
