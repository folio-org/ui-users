import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/currencyData.mock';

import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import loanPolicyNames from 'fixtures/loanPolicyNames';
import openLoans from 'fixtures/openLoans';
import BulkOverrideDialog from './BulkOverrideDialog';

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
const props = {
  additionalInfo: 'test',
  stripes: STRIPES,
  onClose: onCloseMock,
  onCloseRenewModal: jest.fn(),
  showDueDatePicker: true,
  open: true,
  failedRenewals: [],
  loanPolicies: loanPolicyNames,
  user: okapiCurrentUser,
  requestCounts: {},
  errorMessages: {},
};

const renderBulkOverrideDialog = (extraProps = {}) => render(<BulkOverrideDialog {...props} {...extraProps} />);

describe('BulkOverrideDialog', () => {
  test('render empty list', async () => {
    renderBulkOverrideDialog();
    expect(screen.getByText('ui-users.brd.overrideAndRenew')).toBeInTheDocument();
    expect(screen.getByText('stripes-components.tableEmpty')).toBeInTheDocument();
  });
  test('onCancel Click', async () => {
    renderBulkOverrideDialog();
    userEvent.click(screen.getByText('ui-users.cancel'));
    expect(onCloseMock).toHaveBeenCalled();
  });
  test('failed renewals override', async () => {
    renderBulkOverrideDialog({ failedRenewals: openLoans });
    expect(screen.getByText('ui-users.brd.failedRenewal:')).toBeInTheDocument();
  });
});
