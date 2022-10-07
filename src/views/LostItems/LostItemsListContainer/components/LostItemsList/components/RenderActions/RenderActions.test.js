import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import '../../../../../../../../test/jest/__mock__';

import RenderActions from './RenderActions';

const testIds = {
  lostItemsListActionsDropdown: 'lostItemsListActionsDropdown',
  lostItemsListActionsDropdownMenu: 'lostItemsListActionsDropdownMenu',
  patronDetailsLink: 'patronDetailsLink',
  loanDetailsLink: 'loanDetailsLink',
  itemDetailsLink: 'itemDetailsLink',
};
const labelIds = {
  patronDetailsLabel: 'ui-users.lostItems.list.columnName.action.patronDetails',
  loanDetailsLabel: 'ui-users.lostItems.list.columnName.action.loanDetails',
  itemDetailsLabel: 'ui-users.lostItems.list.columnName.action.itemDetails',
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

describe('RenderActions', () => {
  beforeEach(() => {
    render(
      <RenderActions
        {...initialProps}
      />
    );
  });

  it('should render dropdown', () => {
    expect(screen.getByTestId(testIds.lostItemsListActionsDropdown)).toBeVisible();
  });

  it('should render dropdown menu', () => {
    expect(screen.getByTestId(testIds.lostItemsListActionsDropdownMenu)).toBeVisible();
  });

  describe('Patron details', () => {
    it('should render link', () => {
      expect(screen.getByTestId(testIds.patronDetailsLink)).toBeVisible();
    });

    it('should render label', () => {
      expect(screen.getByText(labelIds.patronDetailsLabel)).toBeVisible();
    });

    it('should have correct props', () => {
      const dropdownButton = screen.getByTestId(testIds.patronDetailsLink);

      expect(dropdownButton).toHaveAttribute('to', '/users/preview/88805c06-dbdb-4aa0-9695-d4d19c733221');
    });
  });

  describe('Loan details', () => {
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

  describe('Item details', () => {
    it('should render link', () => {
      expect(screen.getByTestId(testIds.itemDetailsLink)).toBeVisible();
    });

    it('should render label', () => {
      expect(screen.getByText(labelIds.itemDetailsLabel)).toBeVisible();
    });

    it('should have correct props', () => {
      const dropdownButton = screen.getByTestId(testIds.itemDetailsLink);

      expect(dropdownButton).toHaveAttribute('to', '/inventory/view/88805c06-dbdb-4aa0-9695-d4d19c733225/88805c06-dbdb-4aa0-9695-d4d19c733224/88805c06-dbdb-4aa0-9695-d4d19c733223');
    });
  });
});
