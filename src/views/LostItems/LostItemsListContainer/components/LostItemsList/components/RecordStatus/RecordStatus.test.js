import React from 'react';
import { render } from '@testing-library/react';
import { FormattedMessage } from 'react-intl';

import RecordStatus, {
  getBilledAmount,
} from './RecordStatus';

import '../../../../../../../../test/jest/__mock__';

describe('RecordStatus', () => {
  describe('RecordStatus component', () => {
    const messageIds = {
      billed: 'ui-users.lostItems.recordStatus.billed',
      notBilled: 'ui-users.lostItems.recordStatus.notBilled',
    };

    describe('when record is billed', () => {
      const recordId = 'id';
      const billedRecords = [{ recordId }];

      render(
        <RecordStatus
          isBilled
          isCancelled={false}
          billedRecords={billedRecords}
          recordId={recordId}
        />
      );

      it('should trigger "FormattedMessage" with correct id', () => {
        expect(FormattedMessage).toHaveBeenCalledWith(expect.objectContaining({
          id: messageIds.billed,
        }), {});
      });
    });

    describe('when record is cancelled', () => {
      const recordId = 'id';
      const billedRecords = [{ id: 'test' }];

      render(
        <RecordStatus
          isBilled={false}
          isCancelled
          billedRecords={billedRecords}
          recordId={recordId}
        />
      );

      it('should trigger "FormattedMessage" with correct id', () => {
        expect(FormattedMessage).toHaveBeenCalledWith({
          id: messageIds.notBilled,
        }, {});
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
