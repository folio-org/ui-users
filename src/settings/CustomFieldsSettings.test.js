import React from 'react';

import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import CustomFieldsSettings from './CustomFieldsSettings';

jest.unmock('@folio/stripes/components');

const historyPushMock = jest.fn();
const historyReplaceMock = jest.fn();

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
    push: historyPushMock,
    replace: historyReplaceMock,
  },
};

const renderCustomFieldsSettings = (props) => renderWithRouter(
  <>
    <CustomFieldsSettings {...props} />
     CustomFieldsSettings
  </>
);

describe('Custom fields settings page', () => {
  it('should be rendered', () => {
    renderCustomFieldsSettings(propData);

    expect(screen.getByText('CustomFieldsSettings')).toBeDefined();
  });
});
