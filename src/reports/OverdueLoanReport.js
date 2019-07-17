import { get } from 'lodash';
import { exportCsv } from '@folio/stripes/util';

const columns = [
  'borrower.name',
  'borrower.barcode',
  'borrowerId',
  'dueDate',
  'loanDate',
  'loanPolicy.name',
  'loanPolicyId',
  'loanId',
  'feeFine',
  'item.title',
  'item.materialType.name',
  'item.status.name',
  'item.barcode',
  'item.callNumber',
  'item.contributors',
  'item.location.name',
  'item.instanceId',
  'item.holdingsRecordId',
  'itemId',
];

class OverdueLoanReport {
  constructor(options) {
    const { formatMessage } = options;

    this.columnsMap = columns.map(value => ({
      label: formatMessage({ id: `ui-users.reports.overdue.${value}` }),
      value
    }));
  }

  parse(records) {
    return records.map(r => ({
      ...r,
      borrower: {
        ...r.borrower,
        name: `${r.borrower.lastName}, ${r.borrower.firstName} ${r.borrower.middleName || ''}`,
      },
      borrowerId: r.userId,
      loanId: r.id,
      feeFine: get(r, 'feesAndFines.amountRemainingToPay'),
      item: {
        ...r.item,
        contributors: get(r, 'item.contributors', [])
          .filter(c => c)
          .map(c => c.name)
          .join('; '),
      },
    }));
  }

  toCSV(records) {
    const onlyFields = this.columnsMap;
    const parsedRecords = this.parse(records);
    exportCsv(parsedRecords, { onlyFields });
  }
}

export default OverdueLoanReport;
