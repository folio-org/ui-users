import moment from 'moment';

class CashDrawerReconciliationReport {
  constructor({
    intl: {
      formatMessage,
      formatTime,
      formatDate
    },
    headerData
  }) {
    this.formatMessage = formatMessage;
    this.formatTime = formatTime;
    this.formatDate = formatDate;
    this.headerData = headerData;
  }

  buildDocumentName() {
    const name = this.formatMessage({ id: 'ui-users.reports.cash.document.name' });

    return name.split(' ').join('-');
  }

  buildHeader() {
    const DEFAULT_DATE_OPTIONS = {
      timeZone: 'UTC',
    };

    return this.formatMessage(
      { id: 'ui-users.reports.cash.header' },
      {
        servicePoint: this.headerData.createdAt,
        sources: this.headerData.sources,
        startDate: this.formatDate(this.headerData.startDate, DEFAULT_DATE_OPTIONS),
        endDate: this.formatDate(this.headerData.endDate, DEFAULT_DATE_OPTIONS) || moment().format('YYYY/MM/DD') // if no endDate then show date='today'
      }
    );
  }
}

export default CashDrawerReconciliationReport;
