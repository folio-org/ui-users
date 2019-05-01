import { get } from 'lodash';
import { exportCsv } from '@folio/stripes/util';

const columns = [
  'dueDate',
  'loanDate',
  'loanPolicyId',
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
    console.log(parsedRecords);
    exportCsv(parsedRecords, { onlyFields });
  }
}

export default OverdueLoanReport;
