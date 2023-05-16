import React from 'react';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../../../../../../../../test/jest/__mock__';

import LoanDetailsLink from './LoanDetailsLink';

const testIds = {
  loanDetailsLink: 'loanDetailsLink',
};
const labelIds = {
  loanDetailsLabel: 'ui-users.lostItems.list.columnName.action.loanDetails',
};
const initialProps = {
  actualCostRecord: {
    user: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733221',
    },
    loan: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733222',
    },
    item: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733223',
      holdingsRecordId: '88805c06-dbdb-4aa0-9695-d4d19c733224',
    },
    instance: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733225',
    },
  },
};

describe('LoanDetailsLink', () => {
  beforeEach(() => {
    render(
      <LoanDetailsLink
        {...initialProps}
      />
    );
  });

  it('should render link', () => {
    expect(screen.getByTestId(testIds.loanDetailsLink)).toBeVisible();
  });

  it('should render label', () => {
    expect(screen.getByText(labelIds.loanDetailsLabel)).toBeVisible();
  });

  it('should have correct props', () => {
    const dropdownButton = screen.getByTestId(testIds.loanDetailsLink);

    expect(dropdownButton).toHaveAttribute('to', '/users/88805c06-dbdb-4aa0-9695-d4d19c733221/loans/view/88805c06-dbdb-4aa0-9695-d4d19c733222');
  });
});
