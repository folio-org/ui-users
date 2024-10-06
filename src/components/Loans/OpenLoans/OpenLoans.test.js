import React from 'react';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { createMemoryHistory } from 'history';

import '__mock__/currencyData.mock';
import loans from 'fixtures/openLoans';

import { QueryClient, QueryClientProvider } from 'react-query';
import OpenLoans from './OpenLoans';
import {
  nav,
  calculateSortParams,
} from '../../util';

jest.unmock('@folio/stripes/components');
jest.mock('../../util', () => ({
  calculateSortParams: jest.fn(),
  nav: {
    onClickViewLoanActionsHistory: jest.fn(),
  }
}));

const history = createMemoryHistory();
const columns = [
  'actionDate',
  'action',
  'dueDate',
  'itemStatus',
  'source',
  'comments',
];
const visibleColumns = columns.map(columnName => ({
  title: columnName,
  status: true,
}));
const props = {
  history,
  location: history.location,
  isLoanChecked: () => false,
  match: { params: { } },
  loans: [],
  sortMap: { actionDate: 'desc' },
  loanFormatter: {},
  requestCounts: {},
  columnMapping: {},
  sortOrder: ['title'],
  visibleColumns,
  possibleColumns: columns,
};

const queryClient = new QueryClient();

const renderOpenLoans = (extraProps = {}) => render(
  <QueryClientProvider client={queryClient}>
    <OpenLoans {...props} {...extraProps} />
  </QueryClientProvider>
);

afterEach(() => jest.clearAllMocks());

describe('OpenLoans', () => {
  test('render empty list', () => {
    renderOpenLoans();
    expect(screen.queryByText('stripes-components.tableEmpty')).toBeInTheDocument();
  });

  test('render loans', () => {
    renderOpenLoans({ loans });
    expect(screen.queryByText('itemStatus')).toBeInTheDocument();
  });

  test('clicking on a loan row', async () => {
    renderOpenLoans({ loans });
    await userEvent.click(document.querySelector('[data-row-index="row-0"]'));
    expect(nav.onClickViewLoanActionsHistory).toHaveBeenCalledTimes(1);
  });

  test('sorting by clicking on a loan column', async () => {
    renderOpenLoans({ loans });
    await userEvent.click(document.querySelector('[data-test-clickable-header="true"]'));
    expect(calculateSortParams).toHaveBeenCalledTimes(1);
  });

  test('clicking on a loan column when sort map is empty', async () => {
    renderOpenLoans({ loans, sortMap: {} });
    await userEvent.click(document.querySelector('[data-test-clickable-header="true"]'));
    expect(calculateSortParams).toHaveBeenCalledTimes(0);
  });
});
