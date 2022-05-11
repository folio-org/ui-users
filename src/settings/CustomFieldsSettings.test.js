import React from 'react';

import { screen } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/intl.mock';

import renderWithRouter from 'helpers/renderWithRouter';

import CustomFieldsSettings from './CustomFieldsSettings';

jest.unmock('@folio/stripes/components');

const renderCustomFieldsSettings = (props) => renderWithRouter(<CustomFieldsSettings {...props} />);

const propData = {
  resources: {},
  match: { path: '/settings/users/custom-fields' },
  location: { pathname: '/settings/users/custom-fields' },
  mutators: {},
  okapi: {
    url: 'https://folio-testing-okapi.dev.folio.org',
    tenant: 'diku',
    okapiReady: true,
    authFailure: [],
    bindings: {},
  },
  history: {
    push: jest.fn(),
    replace: jest.fn(),
  },
};
describe('Custom fields settings', () => {
  it('Component should render', () => {
    renderCustomFieldsSettings(propData);

    expect(screen.getAllByText('ui-users.customfields.title')[0]).toBeTruthy();
  });
});
