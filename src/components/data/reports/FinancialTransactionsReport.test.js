import FinancialTransactionsReport from './FinancialTransactionsReport';
import options from '../../../../test/jest/__mock__/financialTransactionsReportData.mock';
import emptyOptions from '../../../../test/jest/__mock__/financialTransactionsReportEmptyData.mock';

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
