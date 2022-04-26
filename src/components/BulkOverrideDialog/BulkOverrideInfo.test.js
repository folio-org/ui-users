import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/currencyData.mock';

import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import loanPolicyNames from 'fixtures/loanPolicyNames';
import openLoans from 'fixtures/openLoans';
import BulkOverrideInfo from './BulkOverrideInfo';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const STRIPES = {
  connect: (Component) => Component,
  config: {},
  currency: 'USD',
  hasInterface: () => true,
  hasPerm: jest.fn().mockReturnValue(true),
  clone: jest.fn(),
  setToken: jest.fn(),
  locale: 'en-US',
  logger: {
    log: () => {},
  },
  okapi: {
    tenant: 'diku',
    url: 'https://folio-testing-okapi.dev.folio.org',
  },
  store: {
    getState: () => ({
      okapi: {
        token: 'abc',
      },
    }),
    dispatch: () => {},
    subscribe: () => {},
    replaceReducer: () => {},
  },
  timezone: 'UTC',
  user: {
    perms: {},
    user: {
      id: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
      username: 'diku_admin',
    },
  },
  withOkapi: true,
};
const onCloseMock = jest.fn();
const onCloseRenewModalMock = jest.fn();
const postMock = jest.fn();

const props = {
  additionalInfo: 'test',
  stripes: STRIPES,
  mutator: {
    renew: {
      POST: postMock,
    },
  },
  onCancel: onCloseMock,
  onCloseRenewModal: onCloseRenewModalMock,
  showDueDatePicker: false,
  open: true,
  failedRenewals: [],
  loanPolicies: loanPolicyNames,
  user: okapiCurrentUser,
  requestCounts: {},
  errorMessages: {
    'b6475706-4505-4b20-9ed0-aadcda2b72ee': {
      'overridable' : true,
    }
  },
};

const renderBulkOverrideInfo = (extraProps = {}) => render(<BulkOverrideInfo {...props} {...extraProps} />);

describe('BulkOverrideDialog', () => {
  test('render empty list', async () => {
    renderBulkOverrideInfo();
    expect(screen.getByText('stripes-components.tableEmpty')).toBeInTheDocument();
  });
  test('onCancel Click', async () => {
    renderBulkOverrideInfo();
    userEvent.click(screen.getByText('ui-users.cancel'));
    expect(onCloseMock).toHaveBeenCalled();
  });
  test('failed renewals override', async () => {
    renderBulkOverrideInfo({ failedRenewals: openLoans });
    expect(screen.getByText('ui-users.brd.failedRenewal:')).toBeInTheDocument();
  });
  test('Additional info', async () => {
    renderBulkOverrideInfo({ failedRenewals: openLoans });
    userEvent.click(document.querySelector('[type="checkbox"]'));
    userEvent.type(document.querySelector('[id="data-test-additional-info"]'), 'TestData');
    expect(screen.getByText('testTestData')).toBeInTheDocument();
  });
  test('Override Check', async () => {
    renderBulkOverrideInfo({ failedRenewals: openLoans });
    userEvent.click(document.querySelector('[type="checkbox"]'));
    userEvent.click(screen.getByText('ui-users.button.override'));
    expect(postMock).toHaveBeenCalled();
  });
});
