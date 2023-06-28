const options = {
  data: {
    reportData: [{
      action: 'holdrequested',
      borrower: { firstName: 'Velva', lastName: 'Brakus', middleName: 'Kendall', barcode: '508444097915063' },
      dueDate: '2017-01-19T12:42:21.000+00:00',
      feesAndFines: { amountRemainingToPay: 0 },
      id: '3fd2d7aa-a6fe-4794-9d34-837a6bd31a8b',
      item: {
        barcode: '326547658598',
        callNumber: 'D15.H63 A3 2002',
        callNumberComponents: { callNumber: 'D15.H63 A3 2002' },
        contributors: [{ name: 'Pratchett, Terry' }],
        holdingsRecordId: '67cd0046-e4f1-4e4f-9024-adf0b0039d09',
        id: 'bb5a6689-c008-4c96-8f8f-b666850ee12d',
        instanceId: 'a89eccf0-57a6-495e-898d-32b9b2210f2f',
        location: { name: 'SECOND FLOOR' },
        materialType: { name: 'book' },
        status: { name: 'Checked out', date: '2022-03-01T03:22:42.441+00:00' },
        title: 'Interesting Times'
      },
      itemId: 'bb5a6689-c008-4c96-8f8f-b666850ee12d',
      loanDate: '2017-01-05T12:42:21Z',
      loanPolicy: { name: null },
      lostItemPolicy: { name: null },
      metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' },
      overdueFinePolicy: { name: null },
      status: { name: 'Open' },
      userId: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402',
    }],
    reportStats: {},
  },
  intl: {
    formatMessage: jest.fn(() => ''),
    formatTime: jest.fn(),
    formatDate: jest.fn(),
  },
};

export default options;
