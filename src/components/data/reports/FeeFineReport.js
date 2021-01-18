import { exportCsv } from '@folio/stripes/util';

import { feeFineReportColumns } from '../../../constants';
import _ from 'lodash';
import {
  getFullName,
  formatActionDescription,
  formatCurrencyAmount,
  formatDateAndTime,
  getServicePointOfCurrentAction,
} from '../../util';

class FeeFineReport {
  constructor({ data, intl: { formatMessage, formatTime } }) {
    // data model:
    // data = {
    //  feeFineActions: [] - GET: 'feefineactions?query=(userId==:{id}&limit=${MAX_RECORDS})',
    //  accounts: [] - GET: 'accounts?query=(userId==:{id})&limit=${MAX_RECORDS}',
    //  loans: [] - GET: 'circulation/loans?query=(userId==:{id})&limit=1000',
    //  servicePoints: [] - props.okapi.currentUser.servicePoints
    //  patronGroup: patronGroup,
    //  user: user - GET: 'users/:{id}',
    // }
    this.data = data;
    this.formatMessage = formatMessage;
    this.formatTime = formatTime;
    this.reportData = null;
    this.columnsMap = feeFineReportColumns.map(value => ({
      label: this.formatMessage({ id: `ui-users.reports.feeFine.${value}`}),
      value
    }));
  }

  buildReport() {
    const {
      user = {},
      patronGroup = '',
      servicePoints = [],
      feeFineActions = [],
      accounts = [],
      loans = [],
    } = this.data;

    if (_.isEmpty(feeFineActions)) {
      return;
    }

    const reportData = [];
    const regexpStaff = /STAFF :/i; // utils
    const regexpPatron = /PATRON :/i; //utils

    _.map(feeFineActions, (action) => {
      const account = accounts.find(({ id }) => id === action.accountId);
      const loan = account.loanId ? loans.find(({ id }) => id === account.loanId) : '';
      console.log('currentAccount ', account);
      const reportRowFormatter = {
        patronName: getFullName(user),
        patronBarcode: user.barcode, // link
        patronGroup,
        actionDate: formatDateAndTime(action.dateAction, this.formatTime),
        actionDescription: formatActionDescription(action), // вынести в утилс
        actionAmount: formatCurrencyAmount(action.amountAction),
        actionBalance: formatCurrencyAmount(action.balance),
        actionTransactionInfo: action.transactionInformation !== '-' ? action.transactionInformation : '',
        actionCreatedAt: getServicePointOfCurrentAction(action, servicePoints),
        actionSource: action.source,
        actionInfoStaff: action.comments ? action.comments.split('\n')[0].replace(regexpStaff, '').trim() : '',
        actionInfoPatron: action.comments ? action.comments.split('\n')[1].replace(regexpPatron, '').trim() : '',
        type: account.feeFineType,
        owner: account.feeFineOwner,
        billedDate: formatDateAndTime(account.metadata.createdDate, this.formatTime),
        billedAmount: account.amount ? formatCurrencyAmount(account.amount) : '',
        remainingAmount: formatCurrencyAmount(account.remaining),
        latestPaymentStatus: account.paymentStatus.name,
        itemInstance: account.title || '',
        itemMaterialType: account.materialType || '',
        itemBarcode: account.barcode || '',
        itemCallNumber: account.callNumber || '',
        itemLocation: account.location || '',
        itemDueDate: account.dueDate ? formatDateAndTime(account.dueDate, this.formatTime) : '',
        itemReturnedDate: account.returnedDate ? formatDateAndTime(account.returnedDate, this.formatTime) : '',
        itemOverduePolicy: loan ? loan.overdueFinePolicy.name : '',
        itemLostPolicy: loan ? loan.lostItemPolicy.name : '',
        itemLoanDetail: loan ? loan.id : ''
      };

      reportData.push(reportRowFormatter);
    });

    return reportData;
  }

  parse() {
    this.reportData = this.buildReport();
    const origin = window.location.origin;
    // console.log('reportData ', this.reportData);

    return this.reportData.map(row => {
      return {
        ...row,
        patronBarcode: `=HYPERLINK("${origin}/users/preview/${row.patronId}", "${row.patronId}")`,
        itemBarcode: `=HYPERLINK("${origin}/users")`,
        itemOverduePolicy: `=HYPERLINK("${origin}/users")`,
        itemLostPolicy: `=HYPERLINK("${origin}/users")`,
        itemLoanDetails: `=HYPERLINK("${origin}/users")`,
      };
    });
  }

  toCSV() {
    const onlyFields = this.columnsMap;
    const parsedData = this.parse();

    exportCsv(parsedData, {
      onlyFields,
      filename: 'export-fees-fines-spreadsheet'
    });
  }
}

export default FeeFineReport;
