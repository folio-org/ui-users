import { get } from 'lodash';
import { exportCsv } from '@folio/stripes/util';
import moment from 'moment';
import reportColumns from './reportColumns';



class CsvReport {
  constructor(options) {
    const { formatMessage } = options;
    this.formatMessage = formatMessage;
  }

  setUp(type) {
    const overDueDate = moment().tz('UTC').format();
    let columns;
    this.queryString = '';
    if (type === 'overdue') {
      columns = reportColumns.Overdue;
      this.queryString = `(status.name=="Open" and dueDate < "${overDueDate}") sortby metadata.updatedDate desc`;
    } else if (type === 'claimedReturned') {
      columns = reportColumns.ClaimsReturned;
      this.queryString = '(status.name=="Open" and action="claimedReturned") sortby metadata.updatedDate desc';
    } else {
      return;
    }

    this.columnsMap = columns.map(value => ({
      label: this.formatMessage({ id: `ui-users.reports.${value}` }),
      value
    }));
  }

  async fetchData(mutator) {
    const { GET, reset } = mutator;
    const query = this.queryString;
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

  async generate(mutator, type) {
    this.setUp(type);
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

export default CsvReport;
