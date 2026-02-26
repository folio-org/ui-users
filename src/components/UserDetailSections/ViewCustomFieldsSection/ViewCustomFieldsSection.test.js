import { useStripes } from '@folio/stripes/core';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import ViewCustomFieldsSection from './ViewCustomFieldsSection';

const defaultProps = {
  accordionId: 'customFields',
  customFields: {},
  expanded: true,
  sectionId: 'test-section',
  onToggle: jest.fn(),
};

const renderViewCustomFieldsSection = (props = {}) => {
  return render(<ViewCustomFieldsSection {...defaultProps} {...props} />);
};

describe('ViewCustomFieldsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render ViewCustomFieldsRecord when custom-fields interface is available', () => {
    renderViewCustomFieldsSection();

    expect(screen.getByText('ViewCustomFieldsRecord')).toBeInTheDocument();
  });

  it('should render nothing when custom-fields interface is not available', () => {
    useStripes.mockReturnValueOnce({ hasInterface: () => false });

    renderViewCustomFieldsSection();

    expect(screen.queryByText('ViewCustomFieldsRecord')).not.toBeInTheDocument();
  });
});
