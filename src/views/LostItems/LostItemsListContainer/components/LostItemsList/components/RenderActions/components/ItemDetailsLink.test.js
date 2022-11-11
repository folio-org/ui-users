import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import '../../../../../../../../../test/jest/__mock__';

import ItemDetailsLink from './ItemDetailsLink';

const testIds = {
  itemDetailsLink: 'itemDetailsLink',
};
const labelIds = {
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

describe('ItemDetailsLink', () => {
  beforeEach(() => {
    render(
      <ItemDetailsLink
        {...initialProps}
      />
    );
  });

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
