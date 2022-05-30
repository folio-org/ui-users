import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/currencyData.mock';

import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import loanPolicyNames from 'fixtures/loanPolicyNames';
import openLoans from 'fixtures/openLoans';
import BulkRenewalDialog from './BulkRenewalDialog';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const STRIPES = {
  connect: (Component) => Component,
  config: {},
  currency: 'USD',
  actionNames: [],
  setBindings: jest.fn(),
  setCurrency: jest.fn(),
  setLocale: jest.fn(),
  setSinglePlugin: jest.fn(),
  setTimezone: jest.fn(),
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
const props = {
  additionalInfo: 'test',
  stripes: STRIPES,
  onClose: onCloseMock,
  open: true,
  successRenewals: [],
  failedRenewals: [],
  loanPolicies: loanPolicyNames,
  user: okapiCurrentUser,
  requestCounts: {},
  errorMessages: {},
};

const renderBulkRenewalDialog = (extraProps = {}) => render(<BulkRenewalDialog {...props} {...extraProps} />);

describe('BulkRenewedLoansList', () => {
  test('render empty list', async () => {
    renderBulkRenewalDialog();
    expect(screen.getByText('ui-users.brd.renewConfirmation')).toBeInTheDocument();
  });
  test('onCancel Click', async () => {
    renderBulkRenewalDialog();
    userEvent.click(screen.getByText('stripes-core.button.close'));
    expect(onCloseMock).toHaveBeenCalled();
  });
  test('successRenewals', async () => {
    renderBulkRenewalDialog({ successRenewals: openLoans });
    expect(screen.getByText('ui-users.brd.successfulRenewal')).toBeInTheDocument();
  });
});
