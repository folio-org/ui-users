import moment from 'moment';
import { isEmpty } from 'lodash';

import { exportCsv } from '@folio/stripes/util';

import { financialTransactionsMainReportColumns } from '../../../constants';
import {
  formatCurrencyAmount,
  getValue,
} from '../../util';

import {
  getPatronBarcodeHyperlink,
  getItemBarcodeHyperlink,
  getLoanPolicyHyperlink,
  getOverduePolicyHyperlink,
  getLostItemPolicyHyperlink,
  getLoanDetailsHyperlink,
} from './financialTransactionsReportHelpers';

class FinancialTransactionsReport {
  constructor({
    data,
    intl: {
      formatMessage,
      formatDate,
    },
    headerData,
  }) {
    this.data = data;
    this.formatMessage = formatMessage;
    this.formatDate = formatDate;
    this.headerData = headerData;

    this.columnsMap = financialTransactionsMainReportColumns.map(value => ({
      label: this.formatMessage({ id: `ui-users.reports.financial.${value}` }),
      value,
    }));
  }

  buildDocumentName() {
    const name = this.formatMessage({ id: 'ui-users.reports.financial.name' });

    return name.split(' ').join('-');
  }

  buildHeader() {
    return this.formatMessage(
      { id: 'ui-users.reports.financial.header' },
      {
        owner: this.headerData.feeFineOwner,
        servicePoints: this.headerData.createdAt,
        startDate: this.formatDate(this.headerData.startDate),
        endDate: this.formatDate(this.headerData.endDate) || moment().format('YYYY/MM/DD'), // if no endDate then show date='today'
      }
    );
  }

  generateTranslation(value) {
    return this.formatMessage({ id: `ui-users.reports.financial.${value}` });
  }

  createTable(container, dataToParse, firstColumnName) {
    const emptyLine = { feeFineOwner: '' };

    container.push(emptyLine);
    container.push({
      feeFineOwner: this.generateTranslation(firstColumnName),
      feeFineType: this.generateTranslation('totalAmount'),
      feeFineBilledAmount: this.generateTranslation('totalCount'),
    });

    dataToParse.forEach((row) => {
      const rowValues = {
        feeFineOwner: getValue(row.name),
        feeFineType: formatCurrencyAmount(row.totalAmount),
        feeFineBilledAmount: getValue(row.totalCount),
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
        byFeeFineOwner,
        byFeeFineType,
        byAction,
        byPaymentMethod,
        byWaiveReason,
        byRefundReason,
        byTransferAccount,
      },
    } = this.data;

    if (isEmpty(reportData)) {
      return undefined;
    }

    reportData.forEach((row) => {
      const reportDataRowFormatter = {
        feeFineOwner: getValue(row.feeFineOwner),
        feeFineType: getValue(row.feeFineType),
        feeFineBilledAmount: getValue(row.billedAmount),
        feeFineBilledDate: getValue(row.dateBilled),
        feeFineCreated: getValue(row.feeFineCreatedAt),
        feeFineSource: getValue(row.feeFineSource),
        action: getValue(row.action),
        actionAmount: formatCurrencyAmount(row.actionAmount),
        actionDate: getValue(row.actionDate),
        actionCreated: getValue(row.actionCreatedAt),
        actionSource: getValue(row.actionSource),
        actionStatus: getValue(row.actionStatus),
        actionStaffInfo: getValue(row.actionAdditionalStaffInfo),
        actionPatronInfo: getValue(row.actionAdditionalPatronInfo),
        paymentMethod: getValue(row.paymentMethod),
        paymentTransInfo: getValue(row.transactionInfo),
        waiveReason: getValue(row.waiveReason),
        refundReason: getValue(row.refundReason),
        transferAccount: getValue(row.transferAccount),
        patronName: getValue(row.patronName),
        patronGroup: getValue(row.patronGroup),
        instance: getValue(row.instance),
        contributors: getValue(row.contributors),
        callNumber: getValue(row.callNumber),
        effectiveLocation: getValue(row.effectiveLocation),
        loanDate: getValue(row.loanDate),
        dueDate: getValue(row.dueDate),
        returnDate: getValue(row.returnDate),
        patronId: getValue(row.patronId),
        feeFineId: getValue(row.feeFineId),
        patronBarcode: getValue(row.patronBarcode),
        patronEmail: getValue(row.patronEmail),
        instanceId: getValue(row.instanceId),
        holdingsRecordId: getValue(row.holdingsRecordId),
        itemId: getValue(row.itemId),
        itemBarcode: getValue(row.itemBarcode),
        loanPolicyId: getValue(row.loanPolicyId),
        loanPolicyName: getValue(row.loanPolicyName),
        overdueFinePolicyId: getValue(row.overdueFinePolicyId),
        overdueFinePolicyName: getValue(row.overdueFinePolicyName),
        lostItemPolicyId: getValue(row.lostItemPolicyId),
        lostItemPolicyName: getValue(row.lostItemPolicyName),
        loanId: getValue(row.loanId),
      };

      data.push(reportDataRowFormatter);
    });

    data.push({ feeFineOwner: '' });
    data.push({ feeFineOwner: this.buildHeader() });

    this.createTable(data, byFeeFineOwner, 'feeFineOwner');
    this.createTable(data, byFeeFineType, 'feeFineType');
    this.createTable(data, byAction, 'action');
    this.createTable(data, byPaymentMethod, 'paymentMethod');
    this.createTable(data, byWaiveReason, 'waiveReason');
    this.createTable(data, byRefundReason, 'refundReason');
    this.createTable(data, byTransferAccount, 'transferAccount');

    return data;
  }

  parse() {
    const report = [];
    this.reportData = this.buildReport();
    const origin = window.location.origin;

    if (this.reportData) {
      const partOfReport = this.reportData.map(row => {
        if (row.action) {
          return {
            ...row,
            feeFineDetails: `=HYPERLINK("${origin}/users/${row.patronId}/accounts/view/${row.feeFineId}", "${row.feeFineId}")`,
            patronBarcode: getPatronBarcodeHyperlink(origin, row, this.formatMessage({ id: 'ui-users.reports.financial.patronBarcode.noBarcode' })),
            patronEmail: `=HYPERLINK("mailto:${row.patronEmail}", "${row.patronEmail}")`,
            itemBarcode: getItemBarcodeHyperlink(origin, row),
            loanPolicy: getLoanPolicyHyperlink(origin, row),
            overduePolicy: getOverduePolicyHyperlink(origin, row),
            lostItemPolicy: getLostItemPolicyHyperlink(origin, row),
            loanDetails: getLoanDetailsHyperlink(origin, row),
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

export default FinancialTransactionsReport;
