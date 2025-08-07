import { render } from '@folio/jest-config-stripes/testing-library/react';

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
});
