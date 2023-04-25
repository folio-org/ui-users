import React from 'react';
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

import '../../../../../../../../../../test/jest/__mock__';

import { ACTUAL_COST_DEFAULT } from '../../../../../../../constants';
import ActualCostDetails from './ActualCostDetails';

const testIds = {
  actualCostDetailsButton: 'actualCostDetailsButton',
};
const labelIds = {
  actualCostDetails: 'ui-users.lostItems.list.columnName.action.actualCostDetails',
};
const setActualCostDetailsModal = jest.fn();
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
  setActualCostDetailsModal,
  actualCost: ACTUAL_COST_DEFAULT,
  setActualCost,
};

describe('ActualCostDetails', () => {
  beforeEach(() => {
    render(
      <ActualCostDetails
        {...initialProps}
      />
    );
  });

  it('should render link', () => {
    expect(screen.getByTestId(testIds.actualCostDetailsButton)).toBeVisible();
  });

  it('should render label', () => {
    expect(screen.getByText(labelIds.actualCostDetails)).toBeVisible();
  });

  describe('when click on actual cost details button', () => {
    it('should call setActualCostDetailsModal', () => {
      fireEvent.click(screen.getByTestId(testIds.actualCostDetailsButton));

      expect(setActualCostDetailsModal).toHaveBeenCalled();
    });

    it('should call setActualCost', () => {
      fireEvent.click(screen.getByTestId(testIds.actualCostDetailsButton));

      expect(setActualCost).toHaveBeenCalled();
    });
  });
});
