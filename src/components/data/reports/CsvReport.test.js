import options from '__mock__/csvReportData.mock';
import { waitFor } from '@testing-library/react';
// eslint-disable-next-line no-unused-vars
import moment from 'moment-timezone';
import CsvReport from './CsvReport';

const record = [
  {
    action: 'holdrequested',
    borrower: { firstName: 'Velva', lastName: 'Brakus', middleName: 'Kendall', barcode: '508444097915063' },
    dueDate: '2017-01-19T12:42:21.000+00:00',
    feesAndFines: { amountRemainingToPay: 0 },
    id: '3fd2d7aa-a6fe-4794-9d34-837a6bd31a8b',
    item: {
      barcode: '326547658598',
      callNumber: 'D15.H63 A3 2002',
      callNumberComponents: { callNumber: 'D15.H63 A3 2002' },
      contributors: [{ name: 'Pratchett, Terry' }],
      holdingsRecordId: '67cd0046-e4f1-4e4f-9024-adf0b0039d09',
      id: 'bb5a6689-c008-4c96-8f8f-b666850ee12d',
      instanceId: 'a89eccf0-57a6-495e-898d-32b9b2210f2f',
      location: { name: 'SECOND FLOOR' },
      materialType: { name: 'book' },
      status: { name: 'Checked out', date: '2022-03-01T03:22:42.441+00:00' },
      title: 'Interesting Times'
    },
    itemId: 'bb5a6689-c008-4c96-8f8f-b666850ee12d',
    loanDate: '2017-01-05T12:42:21Z',
    loanPolicy: { name: null },
    lostItemPolicy: { name: null },
    metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' },
    overdueFinePolicy: { name: null },
    status: { name: 'Open' },
    userId: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402',
  }
];

const records = [
  { label: '', value: 'borrower.name' },
  { label: '', value: 'borrower.barcode' },
  { label: '', value: 'borrowerId' },
  { label: '', value: 'dueDate' },
  { label: '', value: 'loanDate' },
  { label: '', value: 'loanPolicy.name' },
  { label: '', value: 'loanPolicyId' },
  { label: '', value: 'loanId' },
  { label: '', value: 'feeFine' },
  { label: '', value: 'item.title' },
  { label: '', value: 'item.materialType.name' },
  { label: '', value: 'item.status.name' },
  { label: '', value: 'item.barcode' },
  { label: '', value: 'item.callNumberComponents.prefix' },
  { label: '', value: 'item.callNumberComponents.callNumber' },
  { label: '', value: 'item.callNumberComponents.suffix' },
  { label: '', value: 'item.volume' },
  { label: '', value: 'item.enumeration' },
  { label: '', value: 'item.chronology' },
  { label: '', value: 'item.copyNumber' },
  { label: '', value: 'item.contributors' },
  { label: '', value: 'item.location.name' },
  { label: '', value: 'item.instanceId' },
  { label: '', value: 'item.holdingsRecordId' },
  { label: '', value: 'itemId' }
];

const mutator = {
  GET: jest.fn(({ params : { offset } }) => new Promise((resolve, _) => {
    if (offset < 1000) {
      resolve(record);
    } else {
      resolve([]);
    }
  })),
  reset: jest.fn(),
};


const mutatorError = {
  GET: jest.fn(() => new Promise((_, reject) => {
    reject();
  })),
  reset: jest.fn(),
};

describe('CsvReport', () => {
  describe('Generate Csv Report Data', () => {
    it('If call is success', async () => {
      const csvreportdata = new CsvReport(options);
      await csvreportdata.generate(mutator, 'overdue');
      expect(csvreportdata.columnsMap).toStrictEqual(records);
    });
    it('If there is error', async () => {
      const csvreportdata = new CsvReport(options);
      try {
        await csvreportdata.generate(mutatorError, 'overdue');
      } catch (error) {
        error.name = '';
        await waitFor(() => expect(error.toString()).toContain('noItemsFound'));
      }
    });
  });
});

