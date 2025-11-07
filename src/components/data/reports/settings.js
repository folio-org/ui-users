import { dayjs } from '@folio/stripes/components';

const settings = {
  overdue: {
    queryString: () => {
      const overDueDate = dayjs().utc().format();
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
