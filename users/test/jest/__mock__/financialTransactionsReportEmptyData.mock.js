const options = {
  data: {
    reportData: [],
    reportStats: {},
  },
  intl: {
    formatMessage: jest.fn(() => ''),
    formatTime: jest.fn(),
    formatDate: jest.fn(),
  },
  headerData: {
    createdAt: 'Online',
    feeFineOwner: 'Anna',
    startDate: '2020/01/05',
    endDate: '2021/01/05'
  }
};

export default options;
