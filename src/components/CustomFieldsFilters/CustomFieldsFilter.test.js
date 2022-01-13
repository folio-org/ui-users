import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import multiSelectCustomField from 'fixtures/multiSelectCustomField';
import radioButtonSetCustomField from 'fixtures/radioButtonSetCustomField';

import '__mock__/matchMedia.mock';

import CustomFieldsFilter from './CustomFieldsFilter';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const props = {
  clearGroup: jest.fn(),
  onChange: jest.fn(),
  activeFilters: {},
};

const renderCustomFieldsFilter = (extraProps) => render(<CustomFieldsFilter {...props} {...extraProps} />);

describe('CustomFieldsFilter', () => {
  it('renders multi select filter', () => {
    renderCustomFieldsFilter({ customField: multiSelectCustomField });
    expect(screen.getByRole('textbox', { name: /multi-select/i })).toBeInTheDocument();
  });

  it('renders radion button set filter', () => {
    renderCustomFieldsFilter({ customField: radioButtonSetCustomField });
    expect(screen.getAllByRole('checkbox', { name: /radio-button-set/i })).toHaveLength(2);
  });

  it('does not render filter with invalid type', () => {
    renderCustomFieldsFilter({ customField: { ...multiSelectCustomField, type: 'CHECKBOX' } });
    expect(screen.queryByRole('textbox', { name: /multi-select/i })).not.toBeInTheDocument();
  });
});
