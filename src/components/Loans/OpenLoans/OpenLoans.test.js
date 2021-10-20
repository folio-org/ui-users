import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';

import '__mock__/currencyData.mock';
import loans from 'fixtures/openLoans';

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

const renderOpenLoans = (extraProps = {}) => render(<OpenLoans {...props} {...extraProps} />);

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

  test('clicking on a loan row', () => {
    renderOpenLoans({ loans });
    userEvent.click(document.querySelector('[data-row-index="row-0"]'));
    expect(nav.onClickViewLoanActionsHistory).toHaveBeenCalledTimes(1);
  });

  test('sorting by clicking on a loan column', () => {
    renderOpenLoans({ loans });
    userEvent.click(document.querySelector('[data-test-clickable-header="true"]'));
    expect(calculateSortParams).toHaveBeenCalledTimes(1);
  });

  test('clicking on a loan column when sort map is empty', () => {
    renderOpenLoans({ loans, sortMap: {} });
    userEvent.click(document.querySelector('[data-test-clickable-header="true"]'));
    expect(calculateSortParams).toHaveBeenCalledTimes(0);
  });
});
