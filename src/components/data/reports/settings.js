import moment from 'moment-timezone';

const settings = {
  overdue: {
    queryString: () => {
      const overDueDate = moment().tz('UTC').format();
      return `(status.name=="Open" and dueDate < "${overDueDate}") sortby metadata.updatedDate desc`;
    },
  },

  claimedReturned: {
    queryString: () => {
      return '(status.name=="Open" and action="claimedReturned") sortby metadata.updatedDate desc';
    }
  }
};

export default settings;
