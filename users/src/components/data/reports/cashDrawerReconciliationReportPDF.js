import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { values } from 'lodash';

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

import CashDrawerReconciliationReport from './CashDrawerReconciliationReport';

const pdfOptions = {
  orientation: 'l',
  unit: 'mm',
  format: 'a4',
  compress: true,
  fontSize: 10,
  lineHeight: 1,
  printHeaders: true,
};

class CashDrawerReconciliationReportPDF extends CashDrawerReconciliationReport {
  constructor({ data, intl, headerData }) {
    super({ intl, headerData });
    this.data = data;
    this.mainReportColumnsMap = this.generateTableColumns(cashMainReportColumns);
    this.sourceReportColumnsMap = this.generateTableColumns(cashSourceReportColumns);
    this.sourceReportFooterMap = this.generateTableColumns(cashSourceReportFooter);
    this.typeReportFooterMap = this.generateTableColumns(cashTypeReportFooter);
    this.ownerReportFooterMap = this.generateTableColumns(cashOwnerReportFooter);
    this.paymentReportFooterMap = this.generateTableColumns(cashPaymentReportFooter);
    this.cashPaymentMethodReportColumnsMap = this.generateTableColumns(cashPaymentMethodReportColumns);
    this.cashFeeFineTypeReportColumnsMap = this.generateTableColumns(cashFeeFineTypeReportColumns);
    this.cashFeeFineOwnerReportColumnsMap = this.generateTableColumns(cashFeeFineOwnerReportColumns);

    // eslint-disable-next-line new-cap
    this.doc = new jsPDF(pdfOptions);
  }

  generateTableColumns(columns) {
    return columns.map(value => ({
      title: this.formatMessage({ id: `ui-users.reports.cash.${value}` }),
      dataKey: this.formatMessage({ id: `ui-users.reports.cash.${value}` })
    }));
  }

  parseData(data, containsFooter = true) {
    const parsedData = data.map((row) => [...values(row)]);

    if (containsFooter) {
      parsedData.pop();
    }

    return parsedData;
  }

  parseFooter(data) {
    const parsedFooter = [...values(data[data.length - 1])];
    parsedFooter.shift();

    return parsedFooter;
  }

  buildFooter(footerData, columnValue) {
    return [
      [
        {
          content: this.formatMessage({ id: `ui-users.reports.cash.${columnValue}` }),
        },
        {
          content: footerData[0],
        },
        {
          content: footerData[1],
        },
      ]
    ];
  }

  toPDF() {
    const getMainReportValues = this.parseData(this.data.reportData, false);
    const getSourceReportValues = this.parseData(this.data.reportStats.bySource);
    const getSourceReportFooter = this.parseFooter(this.data.reportStats.bySource);
    const getByPaymentMethodReportValues = this.parseData(this.data.reportStats.byPaymentMethod);
    const getByPaymentMethodReportFooter = this.parseFooter(this.data.reportStats.byPaymentMethod);
    const getByFeeFineTypeReportValues = this.parseData(this.data.reportStats.byFeeFineType);
    const getByFeeFineTypeReportFooter = this.parseFooter(this.data.reportStats.byFeeFineType);
    const getByFeeFineOwnerReportValues = this.parseData(this.data.reportStats.byFeeFineOwner);
    const getByFeeFineOwnerReportFooter = this.parseFooter(this.data.reportStats.byFeeFineOwner);

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

    this.doc.text(
      `${this.buildHeader()}`,
      15,
      10
    );

    autoTable(this.doc, {
      ...autoTableOptions,
      startY: 15,
      columns: [...this.mainReportColumnsMap],
      body: [...getMainReportValues],
      didParseCell: (data) => {
        data.cell.styles.lineColor = 'black';
        data.cell.styles.lineWidth = 0.1;
      },
      pageBreak: 'avoid'
    });

    autoTable(this.doc, {
      ...autoTableOptions,
      startY: this.doc.autoTable.previous.finalY + 5,
      columns: [...this.sourceReportColumnsMap],
      body: [...getSourceReportValues],
      foot: this.buildFooter(getSourceReportFooter, 'sourceTotal'),
      didParseCell: (data) => {
        data.cell.styles.lineColor = 'black';
        data.cell.styles.lineWidth = 0.1;
      },
      tableWidth: 'wrap',
      pageBreak: 'avoid'
    });

    autoTable(this.doc, {
      ...autoTableOptions,
      startY: this.doc.autoTable.previous.finalY + 5,
      columns: [...this.cashPaymentMethodReportColumnsMap],
      body: [...getByPaymentMethodReportValues],
      foot: this.buildFooter(getByPaymentMethodReportFooter, 'paymentTotal'),
      didParseCell: (data) => {
        data.cell.styles.lineColor = 'black';
        data.cell.styles.lineWidth = 0.1;
      },
      tableWidth: 'wrap',
      pageBreak: 'avoid'
    });

    autoTable(this.doc, {
      ...autoTableOptions,
      startY: this.doc.autoTable.previous.finalY + 5,
      columns: [...this.cashFeeFineTypeReportColumnsMap],
      body: [...getByFeeFineTypeReportValues],
      foot: this.buildFooter(getByFeeFineTypeReportFooter, 'typeTotal'),
      didParseCell: (data) => {
        data.cell.styles.lineColor = 'black';
        data.cell.styles.lineWidth = 0.1;
      },
      tableWidth: 'wrap',
      pageBreak: 'avoid'
    });

    autoTable(this.doc, {
      ...autoTableOptions,
      startY: this.doc.autoTable.previous.finalY + 5,
      columns: [...this.cashFeeFineOwnerReportColumnsMap],
      body: [...getByFeeFineOwnerReportValues],
      foot: this.buildFooter(getByFeeFineOwnerReportFooter, 'ownerTotal'),
      didParseCell: (data) => {
        data.cell.styles.lineColor = 'black';
        data.cell.styles.lineWidth = 0.1;
      },
      tableWidth: 'wrap',
      pageBreak: 'avoid'
    });

    this.doc.save(`${this.buildDocumentName()}.pdf`);
  }
}

export default CashDrawerReconciliationReportPDF;
