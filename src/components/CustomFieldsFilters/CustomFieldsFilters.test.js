import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import '__mock__/matchMedia.mock';

import CustomFieldsFilters from './CustomFieldsFilters';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

jest.mock('@folio/stripes/smart-components', () => {
  // eslint-disable-next-line global-require
  const customField = require('fixtures/multiSelectCustomField');
  return {
    // eslint-disable-next-line global-require
    ...jest.requireActual('@folio/stripes/smart-components'),
    useCustomFields: jest.fn(() => [[customField]]),
  };
});

const props = {
  clearGroup: jest.fn(),
  onChange: jest.fn(),
  activeFilters: {},
};
const renderCustomFieldsFilters = () => render(<CustomFieldsFilters {...props} />);

describe('CustomFieldsFilters', () => {
  it('renders custom filters', () => {
    renderCustomFieldsFilters();
    expect(screen.getByRole('textbox', { name: /multi-select/i })).toBeInTheDocument();
  });
});
