import React from 'react';

import { screen } from '@folio/jest-config-stripes/testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import NumberGeneratorOptions from './NumberGeneratorOptions';

jest.unmock('@folio/stripes/components');

const renderNumberGeneratorSettings = (props) => renderWithRouter(<NumberGeneratorOptions {...props} />);

describe('Number generator settings', () => {
  it('renders', () => {
    renderNumberGeneratorSettings();

    expect(screen.getByTestId('config-manager')).toBeTruthy();
  });
});
