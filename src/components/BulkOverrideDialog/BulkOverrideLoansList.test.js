import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/currencyData.mock';

import loanPolicyNames from 'fixtures/loanPolicyNames';
import openLoans from 'fixtures/openLoans';
import BulkOverrideLoansList from './BulkOverrideLoansList';


jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

const props = {
  intl: {
    formatMessage: jest.fn(),
  },
  allChecked: true,
  failedRenewals: [],
  requestCounts: {},
  loanPolicies: loanPolicyNames,
  errorMessages: {},
  toggleAll: jest.fn(),
  toggleItem: jest.fn(),
  isLoanChecked: jest.fn(),
};

const renderBulkOverrideLoansList = (extraProps = {}) => render(<BulkOverrideLoansList {...props} {...extraProps} />);

describe('BulkRenewedLoansList', () => {
  test('render empty list', async () => {
    renderBulkOverrideLoansList();
    expect(screen.queryByText('stripes-components.tableEmpty')).toBeInTheDocument();
  });
  test('render failed renewals', async () => {
    renderBulkOverrideLoansList({ failedRenewals: openLoans });
    userEvent.click(document.querySelector('[id="list-column-ischecked"]'));
    userEvent.click(document.querySelector('[data-row-inner="0"]'));
    expect(screen.queryByText('ui-users.brd.failedRenewal:')).toBeInTheDocument();
  });
});
