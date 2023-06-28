const options = {
  data: {
    reportData: [{
      source: 'ADMINISTRATOR, DIKU',
      paymentMethod: 'cash',
      paidAmount: '11.00',
      feeFineOwner: 'Anna',
      feeFineType: 'Misc fee',
      paymentDate: '5/13/21, 1:38 PM',
      paymentStatus: 'Paid fully',
      transactionInfo: '# transs',
      additionalStaffInfo: 'Staff info qqq',
      additionalPatronInfo: '',
      patronId: '01f3931e-f9be-44fc-b808-1adb4e7f1729',
      feeFineId: '409452da-7766-47d5-9e02-6ab833af0ecb'
    }, {
      source: 'ADMINISTRATOR, DIKU',
      paymentMethod: 'visa',
      paidAmount: '70.00',
      feeFineOwner: 'Anna',
      feeFineType: 'Misc fee',
      paymentDate: '5/13/21, 1:40 PM',
      paymentStatus: 'Paid fully',
      transactionInfo: '##657577',
      additionalStaffInfo: 'osih 78flk lfknb',
      additionalPatronInfo: '',
      patronId: '01f3931e-f9be-44fc-b808-1adb4e7f1729',
      feeFineId: 'b80e0a3d-d572-4652-8e35-19e8dcf823ef'
    }],
    reportStats: {
      bySource: [{
        name: 'ADMINISTRATOR, DIKU',
        totalAmount: '81.00',
        totalCount: '2'
      }, {
        name: 'Source totals',
        totalAmount: '81.00',
        totalCount: '2'
      }],
      'byPaymentMethod' : [{
        name: 'cash',
        totalAmount: '11.00',
        totalCount: '1'
      }, {
        name: 'visa',
        totalAmount: '70.00',
        totalCount: '1'
      }, {
        name: 'Payment method totals',
        totalAmount: '81.00',
        totalCount: '2'
      }],
      byFeeFineType: [{
        name: 'Misc fee',
        totalAmount: '81.00',
        totalCount: '2'
      }, {
        name: 'Fee/fine type totals',
        totalAmount: '81.00',
        totalCount: '2'
      }],
      byFeeFineOwner: [{
        name: 'Anna',
        totalAmount: '81.00',
        totalCount: '2'
      }, {
        name: 'Fee/fine owner totals',
        totalAmount: '81.00',
        totalCount: '2'
      }]
    }
  },
  intl: {
    formatMessage: jest.fn(() => ''),
    formatTime: jest.fn(),
    formatDate: jest.fn(),
  },
  headerData: {
    createdAt: 'Online',
    sources: 'ADMINISTRATOT, DIKU',
    startDate: '2020/01/05',
    endDate: '2021/01/05'
  }
};

export default options;
