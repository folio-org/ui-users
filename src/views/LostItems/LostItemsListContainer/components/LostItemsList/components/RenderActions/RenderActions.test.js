import React from 'react';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react';

import '../../../../../../../../test/jest/__mock__';

import RenderActions from './RenderActions';
import {
  BillActualCost,
  DoNotBillActualCost,
} from './components';
import { LOST_ITEM_STATUSES } from '../../../../../constants';
import { getRecordStatus } from '../../util';

jest.mock('../../util', () => ({
  getRecordStatus: jest.fn(() => ({
    isBilled: false,
    isCancelled: false,
  })),
}));
jest.mock('./components', () => ({
  ...jest.requireActual('./components'),
  BillActualCost: jest.fn(() => null),
  DoNotBillActualCost: jest.fn(() => null),
}));

const testIds = {
  lostItemsListActionsDropdown: 'lostItemsListActionsDropdown',
  lostItemsListActionsDropdownMenu: 'lostItemsListActionsDropdownMenu',
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
    status: LOST_ITEM_STATUSES.OPEN,
  },
  actualCost: {},
  setActualCostModal: jest.fn(),
  setActualCost: jest.fn(),
};

describe('RenderActions', () => {
  const expectedActualCostProps = {
    actualCostRecord: initialProps.actualCostRecord,
    actualCost: initialProps.actualCost,
    setActualCostModal: initialProps.setActualCostModal,
    setActualCost: initialProps.setActualCost,
    disabled: true,
  };

  beforeEach(() => {
    render(
      <RenderActions
        {...initialProps}
      />
    );
  });

  afterEach(cleanup);

  it('should render dropdown', () => {
    expect(screen.getByTestId(testIds.lostItemsListActionsDropdown)).toBeVisible();
  });

  it('should render dropdown menu', () => {
    expect(screen.getByTestId(testIds.lostItemsListActionsDropdownMenu)).toBeVisible();
  });

  describe('when record was billed', () => {
    getRecordStatus.mockReturnValueOnce({
      isBilled: true,
      isCancelled: false,
    });

    beforeEach(() => {
      render(
        <RenderActions
          {...initialProps}
        />
      );
    });

    it('should trigger "BillActualCost" with correct props', () => {
      expect(BillActualCost).toHaveBeenCalledWith(expectedActualCostProps, {});
    });

    it('should trigger "DoNotBillActualCost" with correct props', () => {
      expect(DoNotBillActualCost).toHaveBeenCalledWith(expectedActualCostProps, {});
    });
  });

  describe('when record was cancelled', () => {
    getRecordStatus.mockReturnValueOnce({
      isBilled: false,
      isCancelled: true,
    });

    beforeEach(() => {
      render(
        <RenderActions
          {...initialProps}
        />
      );
    });

    it('should trigger "BillActualCost" with correct props', () => {
      expect(BillActualCost).toHaveBeenCalledWith(expectedActualCostProps, {});
    });

    it('should trigger "DoNotBillActualCost" with correct props', () => {
      expect(DoNotBillActualCost).toHaveBeenCalledWith(expectedActualCostProps, {});
    });
  });
});
