import { isEmpty } from 'lodash';

import { exportCsv } from '@folio/stripes/util';

import { cashMainReportColumnsCSV } from '../../../constants';
import {
  getValue,
  formatDateAndTime,
  formatCurrencyAmount,
} from '../../util';
import CashDrawerReconciliationReport from './CashDrawerReconciliationReport';

class CashDrawerReconciliationReportCSV extends CashDrawerReconciliationReport {
  constructor({ data, intl, headerData }) {
    super({ intl, headerData });
    this.data = data;

    this.columnsMap = cashMainReportColumnsCSV.map(value => ({
      label: this.formatMessage({ id: `ui-users.reports.cash.${value}` }),
      value
    }));
  }

  generateTranslation(value) {
    return this.formatMessage({ id: `ui-users.reports.cash.${value}` });
  }

  createTable(container, dataToParse, firstColumnName) {
    const emptyLine = { source: '' };

    container.push(emptyLine);
    container.push({
      source: this.generateTranslation(firstColumnName),
      paymentMethod: this.generateTranslation('totalAmount'),
      paymentAmount: this.generateTranslation('totalCount'),
    });

    dataToParse.forEach((row) => {
      const rowValues = {
        source: getValue(row.name),
        paymentMethod: formatCurrencyAmount(row.totalAmount),
        paymentAmount: getValue(row.totalCount),
      };

      container.push(rowValues);
    });

    return container;
  }

  buildReport() {
    const data = [];
    const {
      reportData,
      reportStats: {
        bySource,
        byPaymentMethod,
        byFeeFineType,
        byFeeFineOwner,
      }
    } = this.data;

    if (isEmpty(reportData)) {
      return undefined;
    }

    reportData.forEach((row) => {
      const reportDataRowFormatter = {
        patronId: getValue(row.patronId),
        feeFineId: getValue(row.feeFineId),
        source: getValue(row.source),
        paymentMethod: getValue(row.paymentMethod),
        paymentAmount: formatCurrencyAmount(row.paidAmount),
        feeFineOwner: getValue(row.feeFineOwner),
        feeFineType: getValue(row.feeFineType),
        paymentDateTime: formatDateAndTime(row.paymentDate, this.formatTime),
        paymentStatus: getValue(row.paymentStatus),
        transactionInfo: getValue(row.transactionInfo),
        additionalStaffInfo: getValue(row.additionalStaffInfo),
        additionalPatronInfo: getValue(row.additionalPatronInfo),
      };

      data.push(reportDataRowFormatter);
    });

    data.push({ source: '' });
    data.push({ source: this.buildHeader() });

    this.createTable(data, bySource, 'source');
    this.createTable(data, byPaymentMethod, 'paymentMethod');
    this.createTable(data, byFeeFineType, 'feeFineType');
    this.createTable(data, byFeeFineOwner, 'feeFineOwner');

    return data;
  }

  parse() {
    const report = [];
    this.reportData = this.buildReport();
    const origin = window.location.origin;

    if (this.reportData) {
      const partOfReport = this.reportData.map(row => {
        if (row.feeFineId) {
          return {
            ...row,
            feeFineDetails: `=HYPERLINK("${origin}/users/${row.patronId}/accounts/view/${row.feeFineId}", "${row.feeFineId}")`,
          };
        } else {
          return row;
        }
      });

      partOfReport.forEach((row) => report.push({ ...row }));
    }

    return report;
  }

  toCSV() {
    const parsedData = this.parse();

    exportCsv(parsedData, {
      onlyFields: this.columnsMap,
      filename: this.buildDocumentName(),
    });
  }
}

export default CashDrawerReconciliationReportCSV;
