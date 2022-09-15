import React from 'react';

import { screen } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import NumberGeneratorOptions from './NumberGeneratorOptions';

jest.unmock('@folio/stripes/components');

const renderNumberGeneratorSettings = (props) => renderWithRouter(<NumberGeneratorOptions {...props} />);

describe('Number generator settings', () => {
  it('renders all options', () => {
    renderNumberGeneratorSettings();
    expect(screen.getByText('Use number generator for user barcode.')).toBeTruthy();
    expect(screen.getByText('Use text field for user barcode.')).toBeTruthy();
    expect(screen.getByText('Use number generator for user barcode but allow editing via text field.')).toBeTruthy();
  });
});
