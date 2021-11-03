import React from 'react';

import { screen } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import PatronGroupsSettings from './PatronGroupsSettings';

jest.unmock('@folio/stripes/components');

const renderPatronGroupsSettings = (props) => renderWithRouter(<PatronGroupsSettings {...props} />);

describe('Patron group settings', () => {
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
    renderPatronGroupsSettings(props);

    expect(screen.getByTestId('controlled-vocab')).toBeTruthy();
  });
});
