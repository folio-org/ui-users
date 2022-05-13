import React from 'react';

import '../../test/jest/__mock__';

import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import renderWithRouter from '../../test/jest/helpers/renderWithRouter';

import CustomFieldsSettings from './CustomFieldsSettings';

jest.unmock('@folio/stripes/components');

const historyPushMock = jest.fn();
const historyReplaceMock = jest.fn();

jest.mock('@folio/stripes/smart-components', () => ({
  ViewCustomFieldsSettings: () => <div>ViewCustomFieldsSettings</div>,
}));

jest.mock('@folio/stripes/smart-components', () => ({
  EditCustomFieldsSettings: () => <div>EditCustomFieldsSettings</div>,
}));

const propData = {
  resources: {},
  match: { params: { }, path: '/settings/users/custom-fields', url: '/' },
  location: { pathname: '/settings/users/custom-fields' },
  mutators: {},
  okapi: {
    url: 'https://folio-testing-okapi.dev.folio.org',
    tenant: 'diku',
    okapiReady: true,
    authFailure: [],
    bindings: {},
  },
  stripes: {
    hasPerm: jest.fn(() => true),
    connect: jest.fn((component) => component),
    logger: {
      log: jest.fn(),
    },
  },
  history: {
    push: historyPushMock,
    replace: historyReplaceMock,
  },
};

const renderCustomFieldsSettings = ({ initialEntries }) => {
  renderWithRouter(
    <MemoryRouter initialEntries={initialEntries}>
      <CustomFieldsSettings
        {...propData}
      />
    </MemoryRouter>,
  );
};

describe('Custom fields settings page', () => {
  it('should be rendered', () => {
    renderCustomFieldsSettings('/settings/users/custom-fields');
  });

  it('should redirect on viewCustomFieldsSettings route', async () => {
    renderCustomFieldsSettings(['/settings/users/custom-fields']);

    const viewCustomFieldsSettings = await screen.findByText('/settings/users/custom-fields');
    const viewCustomFieldsSettingsText = await screen.findByText(/ViewCustomFieldsSettings/);

    expect(viewCustomFieldsSettings).toHaveLength(1);
    expect(viewCustomFieldsSettingsText).toBeVisible();
  });
});
