import React from 'react';
import { render, screen } from '@testing-library/react';

import '__mock__/currencyData.mock';

import loanPolicyNames from 'fixtures/loanPolicyNames';
import openLoans from 'fixtures/openLoans';
import BulkRenewedLoansList from './BulkRenewedLoansList';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const props = {
  failedRenewals: [],
  successRenewals: [],
  requestCounts: {},
  loanPolicies: loanPolicyNames,
  errorMessages: {},
};

const renderBulkRenewedLoansList = (extraProps = {}) => render(<BulkRenewedLoansList {...props} {...extraProps} />);

describe('BulkRenewedLoansList', () => {
  test('render empty list', async () => {
    renderBulkRenewedLoansList();

    expect(screen.queryByText('stripes-components.tableEmpty')).toBeInTheDocument();
  });

  test('render successful renewals', async () => {
    renderBulkRenewedLoansList({ successRenewals: openLoans });

    expect(screen.queryByText('ui-users.brd.successfulRenewal')).toBeInTheDocument();
  });

  test('render failed renewals', async () => {
    renderBulkRenewedLoansList({ failedRenewals: openLoans });

    expect(screen.queryByText('ui-users.brd.failedRenewal:')).toBeInTheDocument();
  });
});
