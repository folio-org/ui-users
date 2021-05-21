import CashDrawerReconciliationReportCSV from './cashDrawerReconciliationReportCSV';
import options from '../../../../test/jest/__mock__/cashDrawerReconciliationReportData.mock';

describe('Cash Drawer Reconciliation Report in CSV format', () => {
  const report = new CashDrawerReconciliationReportCSV(options);

  it('should contain fields', () => {
    expect(report.data).toBe(options.data);
  });

  it('should call toCSV method', () => {
    const toCSVSpy = jest.spyOn(report, 'toCSV');
    report.toCSV();

    expect(toCSVSpy).toHaveBeenCalled();
  });
});
