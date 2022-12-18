import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import { noop } from 'lodash';
import { MultiColumnList } from '@folio/stripes/components';
import {
  FormattedDate,
  FormattedTime,
  FormattedMessage,
} from 'react-intl';

import '../../../../../../test/jest/__mock__';
// eslint-disable-next-line import/no-named-as-default
import LostItemsList, {
  triggerOnSort,
  basicLostItemsListFormatter,
  COLUMNS_NAME,
  visibleColumns,
  columnMapping,
  columnWidths,
  isBilledRecord,
  getBilledAmount,
} from './LostItemsList';
import { getPatronName } from './util';
import {
  ActualCostModal,
  ActualCostConfirmModal,
  InstanceDetails,
} from './components';
import {
  ACTUAL_COST_CONFIRM_MODAL_DEFAULT,
  ACTUAL_COST_DEFAULT,
  ACTUAL_COST_MODAL_DEFAULT,
  PAGE_AMOUNT,
} from '../../../constants';

jest.mock('./components', () => ({
  ...jest.requireActual('./components'),
  ActualCostModal: jest.fn(() => null),
  ActualCostConfirmModal: jest.fn(() => null),
  InstanceDetails: jest.fn(() => null),
}));
jest.mock('./util', () => ({
  getPatronName: jest.fn(() => null),
}));
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  FormattedMessage: jest.fn(({ id }) => id),
  FormattedTime: jest.fn(({ value }) => value),
  FormattedDate: jest.fn(({ value }) => value),
}));

const initialProps = {
  contentData: [],
  totalCount: 10,
  onNeedMoreData: jest.fn(),
  emptyMessage: 'empty message',
  onSort: jest.fn(),
  sortOrder: '-',
};
const testIds = {
  lostItemsList: 'lostItemsList',
};
const messageIds = {
  lossType: 'ui-users.lostItems.list.filters.lossType.agedToLost',
};

describe('LostItemsList', () => {
  describe('triggerOnSort', () => {
    const event = {};
    const onSort = jest.fn();

    describe('when there is action column', () => {
      const meta = {
        name: COLUMNS_NAME.ACTION,
      };

      it('should return "noop"', () => {
        expect(triggerOnSort(event, meta, onSort)).toEqual(noop);
      });

      it('should not trigger "onSort"', () => {
        expect(onSort).not.toHaveBeenCalled();
      });
    });

    describe('when there is not action column', () => {
      it('should trigger "onSort" with correct arguments', () => {
        const meta = {
          name: 'test',
        };

        triggerOnSort(event, meta, onSort);

        expect(onSort).toHaveBeenCalledWith(event, meta);
      });
    });
  });

  describe('basicLostItemsListFormatter', () => {
    const basicActualCostRecord = {
      user: {
        patronGroup: 'patronGroup',
      },
      item: {
        permanentLocation: 'permanentLocation',
      },
      feeFine: {
        owner: 'owner',
        type: 'type',
      },
      lossType: 'Aged to lost',
      lossDate: 'lossDate',
    };

    describe('Patron formatter', () => {
      describe('when patron group is presented', () => {
        beforeEach(() => {
          render(basicLostItemsListFormatter[COLUMNS_NAME.PATRON](basicActualCostRecord));
        });

        it('should trigger "getPatronName" with correct arguments', () => {
          expect(getPatronName).toHaveBeenCalledWith(basicActualCostRecord);
        });

        it('should render "patronGroup"', () => {
          expect(screen.getByText(/patronGroup/)).toBeVisible();
        });
      });
    });

    describe('Loss type formatter', () => {
      render(basicLostItemsListFormatter[COLUMNS_NAME.LOSS_TYPE](basicActualCostRecord));

      it('should trigger "FormattedMessage" with correct id', () => {
        expect(FormattedMessage).toHaveBeenCalledWith({
          id: messageIds.lossType,
        }, {});
      });
    });

    describe('Loss date formatter', () => {
      render(basicLostItemsListFormatter[COLUMNS_NAME.LOSS_DATE](basicActualCostRecord));

      it('should trigger "FormattedDate" with correct value', () => {
        expect(FormattedDate).toHaveBeenCalledWith({
          value: basicActualCostRecord.lossDate,
        }, {});
      });

      it('should trigger "FormattedTime" with correct value', () => {
        expect(FormattedTime).toHaveBeenCalledWith({
          value: basicActualCostRecord.lossDate,
        }, {});
      });
    });

    describe('Instance formatter', () => {
      render(basicLostItemsListFormatter[COLUMNS_NAME.INSTANCE](basicActualCostRecord));

      it('should trigger "InstanceDetails" with correct props', () => {
        const expectedProps = {
          actualCostRecord: basicActualCostRecord,
        };

        expect(InstanceDetails).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('Permanent item location formatter', () => {
      it('should return correct data', () => {
        const result = basicLostItemsListFormatter[COLUMNS_NAME.PERMANENT_ITEM_LOCATION](basicActualCostRecord);

        expect(result).toEqual(basicActualCostRecord.item.permanentLocation);
      });
    });

    describe('Fee fine owner formatter', () => {
      it('should return correct data', () => {
        const result = basicLostItemsListFormatter[COLUMNS_NAME.FEE_FINE_OWNER](basicActualCostRecord);

        expect(result).toEqual(basicActualCostRecord.feeFine.owner);
      });
    });

    describe('Fee fine type formatter', () => {
      it('should return correct data', () => {
        const result = basicLostItemsListFormatter[COLUMNS_NAME.FEE_FINE_TYPE](basicActualCostRecord);

        expect(result).toEqual(basicActualCostRecord.feeFine.type);
      });
    });
  });

  describe('Modals', () => {
    beforeEach(() => {
      render(
        <LostItemsList
          {...initialProps}
        />
      );
    });

    const modalsExpectedProps = {
      setActualCostModal: expect.any(Function),
      setActualCostConfirmModal: expect.any(Function),
      actualCost: ACTUAL_COST_DEFAULT,
      setActualCost: expect.any(Function),
    };

    it('"ActualCostModal" should be called with correct props', () => {
      const expectedProps = {
        ...modalsExpectedProps,
        actualCostModal: ACTUAL_COST_MODAL_DEFAULT,
      };

      expect(ActualCostModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('"ActualCostConfirmModal" should be called with correct props', () => {
      const expectedProps = {
        ...modalsExpectedProps,
        actualCostConfirmModal: ACTUAL_COST_CONFIRM_MODAL_DEFAULT,
      };

      expect(ActualCostConfirmModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('MultiColumnList', () => {
    const listExpectedProps = {
      id: 'lostItemsList',
      'data-testid': 'lostItemsList',
      fullWidth: true,
      visibleColumns,
      columnMapping,
      columnWidths,
      rowMetadata: ['id'],
      interactive: false,
      contentData: initialProps.contentData,
      totalCount: initialProps.totalCount,
      onNeedMoreData: initialProps.onNeedMoreData,
      isEmptyMessage: initialProps.emptyMessage,
      onHeaderClick: expect.any(Function),
      sortOrder: '',
      pageAmount: PAGE_AMOUNT,
      pagingType: 'click',
      autosize: true,
      hasMargin: true,
    };

    describe('when "sortOrder" prop starts with "-"', () => {
      beforeEach(() => {
        render(
          <LostItemsList
            {...initialProps}
          />
        );
      });

      it('should be rendered', () => {
        expect(screen.getByTestId(testIds.lostItemsList)).toBeVisible();
      });

      it('should be called with correct props', () => {
        const expectedProps = {
          ...listExpectedProps,
          sortDirection: 'descending',
        };

        expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('when "sortOrder" prop does not start with "-"', () => {
      beforeEach(() => {
        render(
          <LostItemsList
            {...initialProps}
            sortOrder=""
          />
        );
      });

      it('should be called with correct props', () => {
        const expectedProps = {
          ...listExpectedProps,
          sortDirection: 'ascending',
        };

        expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });
  });

  describe('isBilledRecord', () => {
    it('should return true when id is found', () => {
      const recordId = 'recordId';

      expect(isBilledRecord(recordId, [{ id: recordId }])).toBe(true);
    });

    it('should return false when no id found', () => {
      const recordId = 'recordId';

      expect(isBilledRecord(recordId, [])).toBe(false);
    });
  });

  describe('getBilledAmount', () => {
    const billedAmount = '10.50';
    const recordId = 'recordId';

    it('should return billed amount', () => {
      const billedRecords = [{
        id: recordId,
        billedAmount,
      }];

      expect(getBilledAmount(recordId, billedRecords)).toBe(billedAmount);
    });

    it('should return undefined if there is no record with correct id', () => {
      const billedRecords = [{
        id: 'test',
        billedAmount,
      }];

      expect(getBilledAmount(recordId, billedRecords)).toBeUndefined();
    });
  });
});
