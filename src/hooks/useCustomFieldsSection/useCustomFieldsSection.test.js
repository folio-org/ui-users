import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import useCustomFieldsSection from './useCustomFieldsSection';

jest.mock('@folio/stripes/components', () => ({
  Icon: jest.fn(() => <div data-testid="spinner">Loading...</div>),
}));

describe('useCustomFieldsSection', () => {
  const mockSectionId = 'test-section-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useCustomFieldsQuery with correct parameters', () => {
    useCustomFieldsQuery.mockReturnValue({
      customFields: [],
      isLoadingCustomFields: false,
    });

    renderHook(() => useCustomFieldsSection({ sectionId: mockSectionId }));

    expect(useCustomFieldsQuery).toHaveBeenCalledWith({
      moduleName: 'users',
      entityType: 'user',
      sectionId: mockSectionId,
      isVisible: true,
    });
  });

  it('should return loading spinner when isLoadingCustomFields is true', () => {
    useCustomFieldsQuery.mockReturnValue({
      customFields: [],
      isLoadingCustomFields: true,
    });

    const { result } = renderHook(() => useCustomFieldsSection({ sectionId: mockSectionId }));

    expect(result.current.props.icon).toBe('spinner-ellipsis');
  });

  it('should return null when customFields is empty array', () => {
    useCustomFieldsQuery.mockReturnValue({
      customFields: [],
      isLoadingCustomFields: false,
    });

    const { result } = renderHook(() => useCustomFieldsSection({ sectionId: mockSectionId }));

    expect(result.current).toBeNull();
  });

  it('should return undefined when customFields has items', () => {
    useCustomFieldsQuery.mockReturnValue({
      customFields: [{ id: 'field1' }, { id: 'field2' }],
      isLoadingCustomFields: false,
    });

    const { result } = renderHook(() => useCustomFieldsSection({ sectionId: mockSectionId }));

    expect(result.current).toBeUndefined();
  });

  it('should prioritize loading state over custom fields presence', () => {
    useCustomFieldsQuery.mockReturnValue({
      customFields: [{ id: 'field1' }],
      isLoadingCustomFields: true,
    });

    const { result } = renderHook(() => useCustomFieldsSection({ sectionId: mockSectionId }));

    expect(result.current.props.icon).toBe('spinner-ellipsis');
  });
});
