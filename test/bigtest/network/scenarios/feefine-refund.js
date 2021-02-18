export default server => {
  server.post('/feefine-reports/refund', {
    reportData: [
      {
        patronName: 'Ellis, James S',
        patronBarcode: '12345',
        patronId: '54d9cdf3-c928-4919-8d73-fc63c2155765',
        patronGroup: 'Staff',
        feeFineType: 'Lost item processing fee',
        dateBilled: '12/4/2020, 1:13 PM',
        billedAmount: '100.00',
        paidAmount: '100.00',
        paymentMethod: 'Cash',
        transactionInfo: 'ECON #5820',
        transferredAmount: '50.00',
        transferAccount: 'Account',
        feeFineId: '17d9cdf3-c928-4919-8d73-fc63c2155764',
        refundDate: '12/4/2020, 1:13 PM',
        refundAmount: '100.00',
        refundAction: 'Refunded fully',
        refundReason: 'Overpaid',
        staffInfo: 'Refund staff info',
        patronInfo: 'Refund patron info',
        itemBarcode: '123456789',
        instance: 'It\'s raining cats and dogs',
        actionCompletionDate: '12/4/2020, 1:13 PM',
        staffMemberName: 'John Smith',
        actionTaken: '12/4/2020, 1:13 PM'
      }
    ],
    totalRecords: 1,
  });
};
