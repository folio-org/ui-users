import { Form } from 'react-final-form';

import { useStripes } from '@folio/stripes/core';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import EditCustomFieldsSection from './EditCustomFieldsSection';

const defaultProps = {
  accordionId: 'customFields',
  sectionId: 'test-section',
  isCreateMode: false,
};

const renderEditCustomFieldsSection = (props = {}) => {
  return render(
    <Form
      onSubmit={jest.fn()}
      render={() => <EditCustomFieldsSection {...defaultProps} {...props} />}
    />
  );
};

describe('EditCustomFieldsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render EditCustomFieldsRecord when custom-fields interface is available', () => {
    renderEditCustomFieldsSection();

    expect(screen.getByText('EditCustomFieldsRecord accordion')).toBeInTheDocument();
  });

  it('should render nothing when custom-fields interface is not available', () => {
    useStripes.mockReturnValueOnce({ hasInterface: () => false });

    renderEditCustomFieldsSection();

    expect(screen.queryByText('EditCustomFieldsRecord accordion')).not.toBeInTheDocument();
  });
});
