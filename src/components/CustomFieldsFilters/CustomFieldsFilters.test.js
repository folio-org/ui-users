import React from 'react';

import { useCustomFieldsQuery } from '@folio/stripes/smart-components';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import '__mock__/matchMedia.mock';

import customField from 'fixtures/multiSelectCustomField';
import CustomFieldsFilters from './CustomFieldsFilters';

jest.unmock('@folio/stripes/components');

useCustomFieldsQuery.mockReturnValue(({
  customFields: [customField],
  isLoadingCustomFields: false,
  isCustomFieldsError: false,
  refetchCustomFields: jest.fn(),
}));

const props = {
  clearGroup: jest.fn(),
  onChange: jest.fn(),
  activeFilters: {},
};
const renderCustomFieldsFilters = () => render(<CustomFieldsFilters {...props} />);

describe('CustomFieldsFilters', () => {
  it('renders custom filters', () => {
    renderCustomFieldsFilters();
    expect(screen.getByRole('combobox', { name: /multi-select/i })).toBeInTheDocument();
  });
});
