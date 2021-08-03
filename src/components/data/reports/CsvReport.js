import { forOwn, get } from 'lodash';
import { exportCsv } from '@folio/stripes/util';
import settings from './settings';
import { reportColumns } from '../../../constants';
import { formatDateAndTime } from '../../util';

class CsvReport {
  constructor(options) {
    const {
      intl: {
        formatMessage,
        formatTime,
      },
    } = options;

    this.formatMessage = formatMessage;
    this.formatTime = formatTime;
  }

  setUp(type) {
    this.queryString = settings[type].queryString();
    const columns = reportColumns;

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
    if (loans.length !== 0) {
      this.toCSV(loans);
    } else { throw new Error('noItemsFound'); }
  }

  parseDates(record) {
    const result = {};

    forOwn(record, (value, key) => {
      if (key.match(/date/i)) {
        result[key] = formatDateAndTime(value, this.formatTime);
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  parse(records) {
    return records.map(record => {
      const r = this.parseDates(record);

      return {
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
      };
    });
  }

  toCSV(records) {
    const onlyFields = this.columnsMap;
    const parsedRecords = this.parse(records);
    exportCsv(parsedRecords, { onlyFields });
  }
}

export default CsvReport;
