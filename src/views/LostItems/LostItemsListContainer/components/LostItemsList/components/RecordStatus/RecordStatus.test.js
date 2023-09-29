import {
  cleanup,
  render,
} from '@folio/jest-config-stripes/testing-library/react';
import {
  FormattedMessage,
} from 'react-intl';

import {
  FormattedDate,
  FormattedTime,
} from '@folio/stripes/components';

import RecordStatus, {
  getBilledAmount,
} from './RecordStatus';
import { getRecordStatus } from '../../util';
import {
  LOST_ITEM_STATUS_TRANSLATIONS_KEYS,
  LOST_ITEM_STATUSES,
} from '../../../../../constants';

import '../../../../../../../../test/jest/__mock__';

jest.mock('../../util', () => ({
  getRecordStatus: jest.fn(),
}));

const labelIds = {
  open: LOST_ITEM_STATUS_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.OPEN],
  billed: LOST_ITEM_STATUS_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.BILLED],
  cancelled: LOST_ITEM_STATUS_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.CANCELLED],
  expired: LOST_ITEM_STATUS_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.EXPIRED],
};
const initialProps = {
  actualCostRecord: {
    id: 'id',
    status: LOST_ITEM_STATUSES.OPEN,
    expirationDate: 'expirationDate',
  },
  billedRecords: [],
  cancelledRecords: [],
};

describe('RecordStatus', () => {
  describe('component', () => {
    afterEach(cleanup);

    describe('when record is billed', () => {
      getRecordStatus.mockReturnValueOnce({
        isBilled: true,
      });
      render(
        <RecordStatus
          {...initialProps}
        />
      );

      it('should trigger "FormattedMessage" with correct id', () => {
        const expectedProps = {
          id: labelIds.billed,
        };

        expect(FormattedMessage).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('when record is cancelled', () => {
      getRecordStatus.mockReturnValueOnce({
        isCancelled: true,
      });
      render(
        <RecordStatus
          {...initialProps}
        />
      );

      it('should trigger "FormattedMessage" with correct id', () => {
        const expectedProps = {
          id: labelIds.cancelled,
        };

        expect(FormattedMessage).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('when record is expired', () => {
      const props = {
        ...initialProps,
        actualCostRecord: {
          ...initialProps.actualCostRecord,
          status: LOST_ITEM_STATUSES.EXPIRED,
        },
      };

      getRecordStatus.mockReturnValueOnce({
        isBilling: false,
        isCancelled: false,
      });
      render(
        <RecordStatus
          {...props}
        />
      );

      it('should trigger "FormattedMessage" with correct id', () => {
        const expectedProps = {
          id: labelIds.expired,
        };

        expect(FormattedMessage).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should trigger "FormattedDate" with correct value', () => {
        const expectedProps = {
          value: initialProps.actualCostRecord.expirationDate,
        };

        expect(FormattedDate).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should trigger "FormattedTime" with correct value', () => {
        const expectedProps = {
          value: initialProps.actualCostRecord.expirationDate,
        };

        expect(FormattedTime).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('when record is open', () => {
      getRecordStatus.mockReturnValueOnce({
        isCancelled: false,
        isBilled: false,
      });
      render(
        <RecordStatus
          {...initialProps}
        />
      );

      it('should trigger "FormattedMessage" with correct id', () => {
        const expectedProps = {
          id: labelIds.open,
        };

        expect(FormattedMessage).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
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
