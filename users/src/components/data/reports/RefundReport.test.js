import RefundReport from './RefundReport';

const reportData = {
  data : [{
    patronId: 'test1',
    feeFineId: 'testFee1'
  }],
  formatMessage: jest.fn()
};

describe('RefundReport', () => {
  describe('Generate Csv Report Data', () => {
    const csvreportdata = new RefundReport(reportData);
    it('If call is success', async () => {
      const toCSVSpy = jest.spyOn(csvreportdata, 'toCSV');
      csvreportdata.toCSV();
      expect(toCSVSpy).toHaveBeenCalled();
    });
  });
});

