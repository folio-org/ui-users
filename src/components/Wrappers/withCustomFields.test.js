import { render } from '@folio/jest-config-stripes/testing-library/react';

import { useStripes } from '@folio/stripes/core';
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import withCustomFields from './withCustomFields';

const WrappedComponent = jest.fn();
const sectionId = 'test-section';
const isVisible = true;

const renderComponent = (props = {}) => {
  return render(
    withCustomFields(WrappedComponent, {
      isVisible,
      sectionId,
    })(props),
  );
};

describe('withCustomFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render WrappedComponent with custom fields props', () => {
    const customFieldProps = {
      showCustomFieldsSection: false,
      customFieldRecords: [],
      isLoadingCustomFields: false,
      isCustomFieldsError: false,
    };

    const props = {
      accordionId: 'test-accordion',
      ...customFieldProps,
    };

    renderComponent(props);

    expect(useCustomFieldsQuery).toHaveBeenCalledWith({
      moduleName: 'users',
      entityType: 'user',
      sectionId,
      isVisible,
    });
    expect(WrappedComponent).toHaveBeenCalledWith(expect.objectContaining(props), {});
  });

  describe('when custom-fields interface is not available', () => {
    it('should set showCustomFieldsSection to false', () => {
      useStripes.mockReturnValueOnce({ hasInterface: () => false });
      useCustomFieldsQuery.mockReturnValueOnce({
        customFields: [{ id: 'field1' }],
        isLoadingCustomFields: false,
        isCustomFieldsError: false,
      });

      renderComponent({ accordionId: 'test-accordion' });

      expect(WrappedComponent).toHaveBeenCalledWith(
        expect.objectContaining({ showCustomFieldsSection: false }),
        {}
      );
    });
  });

  describe('when interface is available and custom fields exist', () => {
    it('should set showCustomFieldsSection to true', () => {
      useCustomFieldsQuery.mockReturnValueOnce({
        customFields: [{ id: 'field1' }, { id: 'field2' }],
        isLoadingCustomFields: false,
        isCustomFieldsError: false,
      });

      renderComponent({ accordionId: 'test-accordion' });

      expect(WrappedComponent).toHaveBeenCalledWith(
        expect.objectContaining({ showCustomFieldsSection: true }),
        {}
      );
    });
  });
});
