import { cloneDeep, get } from 'lodash';
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
    return cloneDeep(records).map(r => {
      r.item.contributors = get(r, 'item.contributors', []).map(c => c.name);
      return r;
    });
  }

  toCSV(records) {
    const onlyFields = this.columnsMap;
    const parsedRecords = this.parse(records);
    exportCsv(parsedRecords, { onlyFields });
  }
}

export default OverdueLoanReport;
