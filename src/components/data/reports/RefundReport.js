import { exportCsv } from '@folio/stripes/util';
import { refundReportColumns } from '../../../constants';

class RefundsReport {
  constructor({ data, formatMessage }) {
    this.data = data;
    this.formatMessage = formatMessage;
    this.columnsMap = refundReportColumns.map(value => ({
      label: this.formatMessage({ id: `ui-users.reports.refunds.${value}` }),
      value
    }));
  }

  parse() {
    const origin = window.location.origin;

    return this.data.map(row => {
      return {
        ...row,
        patronId: `=HYPERLINK("${origin}/users/preview/${row.patronId}", "${row.patronId}")`,
        feeFineId: `=HYPERLINK("${origin}/users/${row.patronId}/accounts/view/${row.feeFineId}", "${row.feeFineId}")`,
      };
    });
  }

  toCSV() {
    const parsedData = this.parse();

    exportCsv(parsedData, {
      onlyFields: this.columnsMap,
      filename: 'refunds-to-process-manually'
    });
  }
}

export default RefundsReport;
