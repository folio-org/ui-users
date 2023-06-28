import {
  getPatronName,
  getRecordStatus,
  isBilledRecord,
  isCancelledRecord,
} from './util';

describe('utils', () => {
  describe('getPatronName', () => {
    it('should return patron name when lastName present', () => {
      expect(getPatronName({
        user: {
          lastName: 'Do',
        },
      })).toEqual('Do');
    });

    it('should return patron name when firstName and lastName are present', () => {
      expect(getPatronName({
        user: {
          firstName: 'Jo',
          lastName: 'Do',
        },
      })).toEqual('Do, Jo');
    });

    it('should return patron name when firstName, lastName and middleName are present', () => {
      expect(getPatronName({
        user: {
          firstName: 'Jo',
          lastName: 'Do',
          middleName: 'Re',
        },
      })).toEqual('Do, Jo Re');
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

  describe('isCancelledRecord', () => {
    describe('when id is presented', () => {
      it('should return true', () => {
        const recordId = 'recordId';
        const cancelledRecords = [recordId];

        expect(isCancelledRecord(recordId, cancelledRecords)).toBe(true);
      });
    });

    describe('when id is not presented', () => {
      it('should return false', () => {
        const recordId = 'recordId';
        const cancelledRecords = [];

        expect(isCancelledRecord(recordId, cancelledRecords)).toBe(false);
      });
    });
  });

  describe('getRecordStatus', () => {
    const recordId = 'id';

    describe('when record is "Billed"', () => {
      const billedRecords = [{
        id: recordId,
      }];
      const cancelledRecords = [];

      it('should return data for billed record', () => {
        const expectedResult = {
          isBilled: true,
          isCancelled: false,
        };

        expect(getRecordStatus(recordId, billedRecords, cancelledRecords)).toEqual(expectedResult);
      });
    });

    describe('when record is "Cancelled"', () => {
      const billedRecords = [{
        id: 'test',
      }];
      const cancelledRecords = [recordId];

      it('should return data for cancelled record', () => {
        const expectedResult = {
          isBilled: false,
          isCancelled: true,
        };

        expect(getRecordStatus(recordId, billedRecords, cancelledRecords)).toEqual(expectedResult);
      });
    });

    describe('when record is not "Billed" and not "Cancelled"', () => {
      const billedRecords = [{
        id: 'test',
      }];
      const cancelledRecords = ['test'];

      it('should return data for not cancelled and not billed record', () => {
        const expectedResult = {
          isBilled: false,
          isCancelled: false,
        };

        expect(getRecordStatus(recordId, billedRecords, cancelledRecords)).toEqual(expectedResult);
      });
    });
  });
});
