import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/currencyData.mock';

import LoanDetails from './LoanDetails';
import {
  nav,
  calculateSortParams,
} from '../../components/util';

jest.unmock('@folio/stripes/components');

const props = {};
const loans = {};
const renderOpenLoans = (extraProps = {}) => render(<LoanDetails {...props} {...extraProps} />);

afterEach(() => jest.clearAllMocks());

describe.skip('Loan Details', () => {
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
