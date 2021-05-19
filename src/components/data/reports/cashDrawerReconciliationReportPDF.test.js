import CashDrawerReconciliationReportPDF from './cashDrawerReconciliationReportPDF';
import options from '../../../../test/jest/__mock__/cashDrawerReconciliationReportData.mock';

describe('Cash Drawer Reconciliation Report in PDF format', () => {
  const report = new CashDrawerReconciliationReportPDF(options);

  it('should contain fields', () => {
    expect(report.data).toBe(options.data);
  });

  it('should call toPDF method', () => {
    const toPDFSpy = jest.spyOn(report, 'toPDF');
    report.toPDF();

    expect(toPDFSpy).toHaveBeenCalled();
  });
});
