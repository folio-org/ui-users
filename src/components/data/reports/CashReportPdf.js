import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  isEmpty,
  map,
  values,
} from 'lodash';

import {
  cashMainReportColumns,
  cashSourceReportColumns,
  cashPaymentMethodReportColumns,
  cashFeeFineTypeReportColumns,
  cashFeeFineOwnerReportColumns,
  cashSourceReportFooter,
} from '../../../constants';
import {
  getFullName,
  formatActionDescription,
  formatCurrencyAmount,
  formatDateAndTime,
  getServicePointOfCurrentAction,
  calculateRemainingAmount,
} from '../../util';

const pdfOptions = {
  orientation: 'l',
  unit: 'mm',
  format: 'a4',
  compress: true,
  fontSize: 10,
  lineHeight: 1,
  // autoSize: false,
  printHeaders: true
};


class CashReport {
  constructor({ data, intl: { formatMessage, formatTime } }) {
    // data model:
    // data = {
    //  feeFineActions: [] - GET: 'feefineactions?query=(userId==:{id}&limit=${MAX_RECORDS})',
    //  accounts: [] - GET: 'accounts?query=(userId==:{id})&limit=${MAX_RECORDS}',
    //  loans: [] - GET: 'circulation/loans?query=(userId==:{id})&limit=1000',
    //  servicePoints: [] - props.okapi.currentUser.servicePoints
    //  patronGroup: 'group' - string,
    //  user: user - GET: 'users/:{id}',
    // }
    this.data = data;
    this.formatMessage = formatMessage;
    this.formatTime = formatTime;
    this.reportData = null;
    this.mainReportColumnsMap = this.generateTableColumns(cashMainReportColumns);
    this.sourceReportColumnsMap = this.generateTableColumns(cashSourceReportColumns);
    this.sourceReportFooterMap = this.generateTableColumns(cashSourceReportFooter);
    this.cashPaymentMethodReportColumnsMap = this.generateTableColumns(cashPaymentMethodReportColumns);
    this.cashFeeFineTypeReportColumnsMap = this.generateTableColumns(cashFeeFineTypeReportColumns);
    this.cashFeeFineOwnerReportColumnsMap = this.generateTableColumns(cashFeeFineOwnerReportColumns);

    this.doc = new jsPDF(pdfOptions);
  }

  generateTableColumns(columns) {
    return columns.map(value => ({
      title: this.formatMessage({ id: `ui-users.reports.cash.${value}` }),
      dataKey: this.formatMessage({ id: `ui-users.reports.cash.${value}` })
    }));
  }

  buildMainReport() {
    const origin = window.location.origin;

    return [
      {
        source: 'Mistlebauer, Holly',
        paymentMethod: 'Cash',
        paymentAmount: '50.00',
        feeFineOwner: 'Main circ desk',
        feeFineType: 'Lost item fee',
        paymentDateTime: '12/10/2020, 2:37 PM',
        paymentStatus: 'Paid partially',
        transactionInfo: '',
        paymentStaffInfo: 'Patron will pay remaining balance tomorrow',
        paymentPatronInfo: '',
      },
      {
        source: 'Mistlebauer, Holly',
        paymentMethod: 'Cash',
        paymentAmount: '25.00',
        feeFineOwner: 'Main circ desk',
        feeFineType: 'Lost item processing fee',
        paymentDateTime: '12/10/2020, 2:37 PM',
        paymentStatus: 'Paid fully',
        transactionInfo: '',
        paymentStaffInfo: '',
        paymentPatronInfo: '',
      },
      {
        source: 'Leary, Joanne',
        paymentMethod: 'Check',
        paymentAmount: '12.45',
        feeFineOwner: 'Main circ desk',
        feeFineType: 'Overdue fine',
        paymentDateTime: '12/10/2020, 3:33 PM',
        paymentStatus: 'Paid fully',
        transactionInfo: 'Check #3112',
        paymentStaffInfo: '',
        paymentPatronInfo: '',
      },
      {
        source: 'Leary, Joanne',
        paymentMethod: 'Check',
        paymentAmount: '25.00',
        feeFineOwner: 'Main circ desk',
        feeFineType: 'Locker rental fee',
        paymentDateTime: '12/10/2020, 3:44 PM',
        paymentStatus: 'Paid fully',
        transactionInfo: 'Check #3456',
        paymentStaffInfo: 'Patron used check from parent',
        paymentPatronInfo: 'You have been assigned locker #234',
      },
      {
        source: 'Doe, Jane',
        paymentMethod: 'Department charge',
        paymentAmount: '25.00',
        feeFineOwner: 'Main circ desk',
        feeFineType: 'Locker rental fee',
        paymentDateTime: '12/10/2020, 4:10 PM',
        paymentStatus: 'Paid fully',
        transactionInfo: 'Acct #LDP1234',
        paymentStaffInfo: '',
        paymentPatronInfo: 'You have been assigned locker #345',
      },
      {
        source: 'Doe, Jane',
        paymentMethod: 'Credit card',
        paymentAmount: '16.32',
        feeFineOwner: 'Main circ desk',
        feeFineType: 'Overdue fine',
        paymentDateTime: '12/10/2020, 4:11 PM',
        paymentStatus: 'Paid fully',
        transactionInfo: 'Trans #93343244325',
        paymentStaffInfo: '',
        paymentPatronInfo: '',
        // feeFineDetails: this.doc.textWithLink(
        //   '9dfef8c0-9682-4dbd-8777-193ef33e795b', 200, 90,
        //   {
        //     url: `${origin}/users/${666666}/accounts/view/9dfef8c0-9682-4dbd-8777-193ef33e795b`,
        //     styles: {
        //       fontSize: 8,
        //       color: 'blue',
        //     },
        //   }
        // ),
      },
    ];
  }

  buildSourceReport() {
    return [
      {
        source: 'Doe, Jane',
        totalAmount: '149.64',
        totalCount: '9'
      },
      {
        source: 'Mistlebauer, Holly',
        totalAmount: '37.45',
        totalCount: '9'
      },
      {
        source: 'Leary, Joanne',
        totalAmount: '75.00',
        totalCount: '9'
      },
    ];
  }

  // getColumnWidth(data) {
  //   const settingsColumnWidth = {};
  //
  //   data.forEach((column, index) => {
  //     settingsColumnWidth[column] = {
  //       cellWidth: 'auto'
  //     };
  //   });
  //
  //   console.log('settingsColumnWidth  ', settingsColumnWidth);
  //   return settingsColumnWidth;
  // }

  parseMainReport() {
    this.mainReportData = this.buildMainReport();
    const origin = window.location.origin;

    return this.mainReportData.map(row => values(row));
  }

  parseSourceReport() {
    this.sourceReportData = this.buildSourceReport();
    const origin = window.location.origin;

    return this.sourceReportData.map(row => values(row));
  }

  toPDF() {
    const parsedMainReportData = this.parseMainReport();
    const getMainReportValues = parsedMainReportData.map((row) => [...values(row)]);
    const parsedSourceReportData = this.parseSourceReport();
    const getSourceReportValues = parsedSourceReportData.map((row) => [...values(row)]);

    const autoTableOptions = {
      tableLineColor: 'Black',
      tableLineWidth: 0.1,
      theme: 'plain',
      showHead: 'everyPage',
      rowPageBreak: 'auto',
      pageBreak: 'auto',
      tableWidth: 'auto',
      styles: {
        cellPadding: 2,
        fontSize: 8,
      },
      headStyles: {
        fontStyle: 'bold'
      },
      footStyles: {
        fontStyle: 'bold',
      },
      startY: 7,
      startX: 2,
      cellWidth: 'auto'
    };

    console.log('this.doc ', this.doc);
    // read only
    // this.doc.securityHandlers({
    //   userPassword: 'test'
    // });


    this.doc.text('Cash Drawer Reconciliation Report for Service Point Source(s) - 12/10/2020 to 15/10/2020', 15, 10);
    autoTable(this.doc, {
      ...autoTableOptions,
      startY: 15,
      columns: [...this.mainReportColumnsMap],
      body: [...getMainReportValues],
      didParseCell: (data) => {
        data.cell.styles.lineColor = 'black';
        data.cell.styles.lineWidth = 0.1;
      },
    });

    autoTable(this.doc, {
      ...autoTableOptions,
      startY: this.doc.autoTable.previous.finalY + 5,
      columns: [...this.sourceReportColumnsMap],
      body: [...getSourceReportValues],
      foot: [
        [
          {
            content: this.formatMessage({ id: 'ui-users.reports.cash.sourceTotal' }),
            styles: { fontStyle: 'bold' },
          },
          {
            content: '262.09',
            styles: { fontStyle: 'bold' },
          },
          {
            content: '8',
            styles: { fontStyle: 'bold' },
          },
        ]
      ],
      didParseCell: (data) => {
        data.cell.styles.lineColor = 'black';
        data.cell.styles.lineWidth = 0.1;
      },
    });

    autoTable(this.doc, {
      ...autoTableOptions,
      startY: this.doc.autoTable.previous.finalY + 5,
      columns: [...this.sourceReportColumnsMap],
      body: [...getSourceReportValues],
      foot: [
        [
          {
            content: this.formatMessage({ id: 'ui-users.reports.cash.sourceTotal' }),
            styles: { fontStyle: 'bold' },
          },
          {
            content: '262.09',
            styles: { fontStyle: 'bold' },
          },
          {
            content: '8',
            styles: { fontStyle: 'bold' },
          },
        ]
      ],
      didParseCell: (data) => {
        data.cell.styles.lineColor = 'black';
        data.cell.styles.lineWidth = 0.1;
      },
    });

    autoTable(this.doc, {
      ...autoTableOptions,
      startY: this.doc.autoTable.previous.finalY + 15,
      columns: [...this.sourceReportColumnsMap],
      body: [...getSourceReportValues],
      foot: [
        [
          {
            content: this.formatMessage({ id: 'ui-users.reports.cash.sourceTotal' }),
            styles: { fontStyle: 'bold' },
          },
          {
            content: '262.09',
            styles: { fontStyle: 'bold' },
          },
          {
            content: '8',
            styles: { fontStyle: 'bold' },
          },
        ]
      ],
      didParseCell: (data) => {
        data.cell.styles.lineColor = 'black';
        data.cell.styles.lineWidth = 0.1;
      },
    });

    this.doc.save('table.pdf');
  }
}

export default CashReport;
