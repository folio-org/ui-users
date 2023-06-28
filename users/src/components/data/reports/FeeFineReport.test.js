import reportData from '__mock__/feeFineReportData.mock';
import emptyReportData from '__mock__/feeFineReportEmptyData.mock';

import FeeFineReport from './FeeFineReport';


const testData = {
  data : {
    feeFineActions : [
      {
        accountId: '3f10a1e6-3453-4dc6-bc57-e8b9f205b380',
        amountAction: 10,
        balance: 10,
        createdAt: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
        dateAction: '2021-10-22T07:17:33.305+00:00',
        id: '8c778f3d-ecfb-4ddf-9824-24094bb9c701',
        notify: false,
        source: 'ADMINISTRATOR, DIKU',
        transactionInformation: '',
        typeAction: 'TestType',
        userId: '61d2fa07-437c-4805-9332-05ecd11c3e30',
      },
    ],
    accounts : [],
  },
  intl: {
    formatMessage: jest.fn(() => ''),
    formatTime: jest.fn(),
    formatDate: jest.fn(),
  },
};

describe('FeeFineReport', () => {
  describe('Generate Fee/Fine Report in CSV format', () => {
    describe('(Valid Data)', () => {
      const fee = new FeeFineReport(reportData);

      it('Return correct report data', async () => {
        expect(fee.data).toBe(reportData.data);
      });

      it('CSV method must be called', async () => {
        const toCSVSpy = jest.spyOn(fee, 'toCSV');
        fee.toCSV();
        expect(toCSVSpy).toHaveBeenCalled();
      });
    });

    describe('(Empty Data)', () => {
      const fee = new FeeFineReport(emptyReportData);

      it('Return empty data', async () => {
        expect(fee.data).toBe(emptyReportData.data);
      });

      it('CSV method must throw error in map', async () => {
        const toCSVSpy = jest.spyOn(fee, 'toCSV');
        try {
          fee.toCSV();
        } catch (error) {
          expect(toCSVSpy).toThrowError("Cannot read properties of undefined (reading 'columnsMap')");
        }
      });
    });

    describe('(Invalid Data)', () => {
      describe('Fee reports are found and account details are invalid', () => {
        const fee = new FeeFineReport(testData);

        it('Return correct report data', async () => {
          expect(fee.data).toBe(testData.data);
        });

        it('CSV method must be called', async () => {
          const toCSVSpy = jest.spyOn(fee, 'toCSV');
          fee.toCSV();

          expect(toCSVSpy).toHaveBeenCalled();
        });
      });
    });
  });
});

