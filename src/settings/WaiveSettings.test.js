import React from 'react';

import { screen } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import WaiveSettings from './WaiveSettings';

jest.unmock('@folio/stripes/components');

const renderWaiveSettings = (props) => renderWithRouter(<WaiveSettings {...props} />);

describe('Waive settings', () => {
  it('renders', () => {
    const props = {
      resources: {},
      match: { path: '/settings/users/departments' },
      location: { pathname: '/settings/users/departments' },
      mutators: {},
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
    };
    renderWaiveSettings(props);

    expect(screen.getByTestId('controlled-vocab')).toBeTruthy();
  });
});
