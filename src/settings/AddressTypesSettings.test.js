import React from 'react';

import { screen } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import AddressTypesSettings from './AddressTypesSettings';

jest.unmock('@folio/stripes/components');

const renderAddressTypesSettings = (props) => renderWithRouter(<AddressTypesSettings {...props} />);

describe('Address-types settings', () => {
  it('renders', () => {
    const props = {
      resources: {},
      match: { path: '/settings/users/addresstypes' },
      location: { pathname: '/settings/users/addresstypes' },
      mutators: {},
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
    };
    renderAddressTypesSettings(props);

    expect(screen.getByTestId('controlled-vocab')).toBeTruthy();
  });
});
