import { get } from 'lodash';
import { exportCsv } from '@folio/stripes/util';
import moment from 'moment';

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
  'item.callNumberComponents.prefix',
  'item.callNumberComponents.callNumber',
  'item.callNumberComponents.suffix',
  'item.enumeration',
  'item.volume',
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

  async fetchData(mutator) {
    const { GET, reset } = mutator;
    const overDueDate = moment().tz('UTC').format();
    const query = `(status.name=="Open" and dueDate < "${overDueDate}") sortby metadata.updatedDate desc`;
    const limit = 1000;
    const data = [];

    let offset = 0;
    let hasData = true;

    while (hasData) {
      try {
        reset();
        // eslint-disable-next-line no-await-in-loop
        const result = await GET({ params: { query, limit, offset } });
        hasData = result.length;
        offset += limit;
        if (hasData) {
          data.push(...result);
        }
      } catch (err) {
        hasData = false;
      }
    }

    return data;
  }

  async generate(mutator) {
    const loans = await this.fetchData(mutator);
    this.toCSV(loans);
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
