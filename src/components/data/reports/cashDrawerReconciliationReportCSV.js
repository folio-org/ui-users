import { exportCsv } from '@folio/stripes/util';

import {
  cashMainReportColumns,
  cashSourceReportColumns,
  cashPaymentMethodReportColumns,
  cashFeeFineTypeReportColumns,
  cashFeeFineOwnerReportColumns,
  cashSourceReportFooter,
  cashOwnerReportFooter,
  cashPaymentReportFooter,
  cashTypeReportFooter,
} from '../../../constants';
import { isEmpty } from 'lodash';

class cashDrawerReconciliationReportCSV {
  constructor({ data, intl: { formatMessage, formatTime }, headerData }) {
    this.data = data;
    this.formatMessage = formatMessage;
    this.formatTime = formatTime;
    this.headerData = headerData;

    this.columnsMap = cashMainReportColumns.map(value => ({
      label: this.formatMessage({ id: `ui-users.reports.cash.${value}` }),
      value
    }));
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

    reportData.map((row) => {
      console.log('row ', row);
      const reportRowFormatter = {

      }

      data.push(reportRowFormatter);
    })
  }

  parse() {
    this.reportData = this.buildReport();
    const origin = window.location.origin;

    return this.reportData.map(row => {
      return {
        ...row,
        patronBarcode: `=HYPERLINK("${origin}/users/preview/${row.patronId}", "${row.patronBarcode}")`,
        details: `=HYPERLINK("${origin}/users/${row.patronId}/accounts/view/${row.details}", "${row.details}")`,
        itemBarcode: `=HYPERLINK("${origin}/inventory/view/${row.itemInstanceId}/${row.itemHoldingsRecordId}/${row.itemId}", "${row.itemBarcode}")`,
        itemOverduePolicy: `=HYPERLINK("${origin}/settings/circulation/fine-policies/${row.itemOverduePolicyId}", "${row.itemOverduePolicy}")`,
        itemLostPolicy: `=HYPERLINK("${origin}/settings/circulation/lost-item-fee-policy/${row.itemLostPolicyId}", "${row.itemLostPolicy}")`,
        itemLoanDetails: `=HYPERLINK("${origin}/users/${row.patronId}/loans/view/${row.loanId}", "${row.loanId}")`,
      };
    });
  }


}

export default cashDrawerReconciliationReportCSV;
