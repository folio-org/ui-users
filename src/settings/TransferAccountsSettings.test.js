import React from 'react';

import { screen } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import TransferAccountsSettings from './TransferAccountsSettings';

jest.unmock('@folio/stripes/components');

const renderTransferAccountsSettings = (props) => renderWithRouter(<TransferAccountsSettings {...props} />);

describe('Transfer accounts settings', () => {
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
    renderTransferAccountsSettings(props);

    expect(screen.getByTestId('controlled-vocab')).toBeTruthy();
  });
});
