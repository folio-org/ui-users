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
    sources: 'ADMINISTRATOT, DIKU',
    startDate: '2020/01/05',
    endDate: '2021/01/05'
  }
};

export default options;
