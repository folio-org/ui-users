import React from 'react';
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

import '../../../../../../../../../test/jest/__mock__';

import { ACTUAL_COST_DEFAULT } from '../../../../../../constants';

import BillActualCost from './BillActualCost';

const testIds = {
  billActualCostButton: 'billActualCostButton',
};
const labelIds = {
  billActualCostLabel: 'ui-users.lostItems.list.columnName.action.bill',
};
const setActualCostModal = jest.fn();
const setActualCost = jest.fn();
const initialProps = {
  actualCostRecord: {
    user: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733221',
      firstName: 'firstName',
      lastName: 'lastName',
      middleName: 'middleName',
    },
    loan: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733222',
    },
    item: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733223',
      holdingsRecordId: '88805c06-dbdb-4aa0-9695-d4d19c733224',
      materialType: 'materialType',
    },
    feeFine: {
      owner: 'owner',
      type: 'type',
    },
    instance: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733225',
      title: 'title',
    },
  },
  setActualCostModal,
  actualCost: ACTUAL_COST_DEFAULT,
  setActualCost,
};

describe('BillActualCost', () => {
  beforeEach(() => {
    render(
      <BillActualCost
        {...initialProps}
      />
    );
  });

  it('should render link', () => {
    expect(screen.getByTestId(testIds.billActualCostButton)).toBeVisible();
  });

  it('should render label', () => {
    expect(screen.getByText(labelIds.billActualCostLabel)).toBeVisible();
  });

  describe('when click on bill actual cost button', () => {
    it('should call setActualCostModal', () => {
      fireEvent.click(screen.getByTestId(testIds.billActualCostButton));

      expect(setActualCostModal).toHaveBeenCalled();
    });

    it('should call setActualCost', () => {
      fireEvent.click(screen.getByTestId(testIds.billActualCostButton));

      expect(setActualCost).toHaveBeenCalled();
    });
  });
});
