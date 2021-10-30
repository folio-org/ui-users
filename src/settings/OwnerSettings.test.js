import React from 'react';

import { screen } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import OwnerSettings from './OwnerSettings';

jest.unmock('@folio/stripes/components');

const renderOwnerSettings = (props) => renderWithRouter(<OwnerSettings {...props} />);

describe('Owner settings', () => {
  it('renders', () => {
    const props = {
      resources: {},
      match: { path: '/settings/users/asdf' },
      location: { pathname: '/settings/users/asdf' },
      mutators: {},
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
    };
    renderOwnerSettings(props);

    expect(screen.getByTestId('controlled-vocab')).toBeTruthy();
  });
});
