import options from '__mock__/financialTransactionsReportData.mock';
import emptyOptions from '__mock__/financialTransactionsReportEmptyData.mock';

import FinancialTransactionsReport from './FinancialTransactionsReport';

describe('Financial Transactions Report in CSV format', () => {
  const report = new FinancialTransactionsReport(options);

  it('should contain fields', () => {
    expect(report.data).toBe(options.data);
  });

  it('should call toCSV method', () => {
    const toCSVSpy = jest.spyOn(report, 'toCSV');
    report.toCSV();

    expect(toCSVSpy).toHaveBeenCalled();
  });
});

describe('Financial Transactions Report in CSV format (empty data)', () => {
  const report = new FinancialTransactionsReport(emptyOptions);

  it('should contain fields', () => {
    expect(report.data).toBe(emptyOptions.data);
  });

  it('should call toCSV method', () => {
    const toCSVSpy = jest.spyOn(report, 'toCSV');
    report.toCSV();

    expect(toCSVSpy).toHaveBeenCalled();
  });
});
