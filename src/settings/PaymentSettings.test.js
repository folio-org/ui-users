import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import { buildResources } from 'helpers/buildResources';
import PaymentSettings from './PaymentSettings';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');


const payment = [
  {
    'nameMethod' : 'Test',
    'allowedRefundMethod' : true,
    'metadata' : {
      'createdDate' : '2021-12-28T13:42:09.978+00:00',
      'createdByUserId' : '7a626480-284e-5b55-9cf2-db32f93956cf',
      'updatedDate' : '2021-12-28T13:42:09.978+00:00',
      'updatedByUserId' : '7a626480-284e-5b55-9cf2-db32f93956cf'
    },
    'ownerId' : '6b3884f3-8066-47a7-b44e-5adcd6350d61',
    'id' : 'b2b5682a-6579-4ba2-9e6b-bd98b6c3aa9d'
  },
];

const resources = buildResources({
  resourceName: ['values'],
  updaterName: ['updaters'],
  records: payment,
  updaterRecords: payment,
});

const ownerData = [
  {
    id: '6b3884f3-8066-47a7-b44e-5adcd6350d61',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test2',
    servicePointOwner: []
  },
  {
    id: '6f7577f6-5acf-4cd1-9470-54b40153c1d7',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test1',
    servicePointOwner: []
  }
];

const mutator = {
  updaterIds: {
    replace: jest.fn(),
    update: jest.fn(),
  },
  owners: {
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
    reset: jest.fn(),
    GET: jest.fn().mockResolvedValue(ownerData),
  },
  values:{
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn().mockResolvedValue(Promise.resolve()),
    PUT: jest.fn(),
    cancel: jest.fn(),
  }
};

const propData = {
  stripes: {
    connect: (Component) => props => <Component {...props} resources={resources} />,
    hasPerm: jest.fn().mockResolvedValue(true),
  },
  mutator,
  match: { path: '/settings/users/payments' },
  location: { pathname: '/settings/users/payments' },
  intl: {},
  okapi: {
    url: 'https://folio-testing-okapi.dev.folio.org',
    tenant: 'diku',
    okapiReady: true,
    authFailure: [],
    bindings: {},
  },
};


const renderPaymentSettings = async (props) => renderWithRouter(<PaymentSettings {...props} />);

describe('Payment settings', () => {
  beforeEach(async () => {
    await waitFor(() => renderPaymentSettings(propData));
  });
  it('component must be rendered', async () => {
    expect(screen.getByText('ui-users.payments.columns.name')).toBeTruthy();
  });
  it('Onchange owner', async () => {
    userEvent.selectOptions(document.querySelector('[id="select-owner"]'), screen.getByText('test2'));
    expect(screen.getByText('Test')).toBeTruthy();
  });
  it('Delete payment', async () => {
    userEvent.click(document.querySelector('[id="clickable-delete-settings-payments-0"]'));
    userEvent.click(document.querySelector('[id="clickable-delete-controlled-vocab-entry-confirmation-cancel"]'));
    expect(document.querySelector('[data-test-confirmation-modal-message="true"]')).toBeTruthy();
  });
  it('Create payment', async () => {
    userEvent.click(document.querySelector('[id="clickable-add-settings-payments"]'));
    userEvent.type(document.querySelector('[name="items[0].nameMethod"]'), 'tesstNew');
    userEvent.selectOptions(screen.getByTestId('field-allowedRefundMethod'), screen.getByText('ui-users.feefines.modal.no'));
    userEvent.click(document.querySelector('[id="clickable-save-settings-payments-0"]'));
    expect(screen.getByText('stripes-core.button.save')).toBeTruthy();
  });
});
