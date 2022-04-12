import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/currencyData.mock';

import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import loanPolicyNames from 'fixtures/loanPolicyNames';
import openLoans from 'fixtures/openLoans';
import BulkRenewInfo from './BulkRenewInfo';

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
  actionNames: [],
};
const onCancelMock = jest.fn();
const props = {
  additionalInfo: 'test',
  stripes: STRIPES,
  onCancel: onCancelMock,
  open: jest.fn(),
  successRenewals: [],
  failedRenewals: [],
  mutator: {},
  loanPolicies: loanPolicyNames,
  user: okapiCurrentUser,
  requestCounts: {},
  errorMessages: {
    'b6475706-4505-4b20-9ed0-aadcda2b72ee': {
      'overridable' : true,
    }
  },
};

const renderBulkRenewInfo = (extraProps = {}) => render(<BulkRenewInfo {...props} {...extraProps} />);

describe('BulkRenewedInfo', () => {
  test('render empty list', async () => {
    renderBulkRenewInfo();
    expect(screen.getByText('stripes-components.tableEmpty')).toBeInTheDocument();
  });
  test('successRenewals', async () => {
    renderBulkRenewInfo({ successRenewals: openLoans });
    expect(screen.getByText('ui-users.brd.successfulRenewal')).toBeInTheDocument();
  });
  test('failedRenewals', async () => {
    renderBulkRenewInfo({ failedRenewals: openLoans });
    expect(screen.getByText('ui-users.brd.failedRenewal:')).toBeInTheDocument();
  });
  test('onCancel Click', async () => {
    renderBulkRenewInfo();
    userEvent.click(screen.getByText('stripes-core.button.close'));
    expect(onCancelMock).toHaveBeenCalled();
  });
});
