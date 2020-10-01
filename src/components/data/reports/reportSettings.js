import moment from 'moment';

const settings = {
  'overdue': {
    'queryString': () => {
      const overDueDate = moment().tz('UTC').format();
      return `(status.name=="Open" and dueDate < "${overDueDate}") sortby metadata.updatedDate desc`;
    },
    'columns' : [
      'borrower.name',
      'borrower.barcode',
      'borrowerId',
      'dueDate',
      'loanDate',
      'loanPolicy.name',
      'loanPolicyId',
      'loanId',
      'feeFine',
      'item.title',
      'item.materialType.name',
      'item.status.name',
      'item.barcode',
      'item.callNumberComponents.prefix',
      'item.callNumberComponents.callNumber',
      'item.callNumberComponents.suffix',
      'item.volume',
      'item.enumeration',
      'item.chronology',
      'item.copyNumber',
      'item.contributors',
      'item.location.name',
      'item.instanceId',
      'item.holdingsRecordId',
      'itemId']
  },

  'claimedReturned': {
    'queryString': () => {
      return '(status.name=="Open" and action="claimedReturned") sortby metadata.updatedDate desc';
    },
    'columns': [
      'borrower.name',
      'borrower.barcode',
      'borrowerId',
      'dueDate',
      'loanDate',
      'loanPolicy.name',
      'loanPolicyId',
      'loanId',
      'feeFine',
      'item.title',
      'item.materialType.name',
      'item.status.name',
      'item.barcode',
      'item.callNumberComponents.prefix',
      'item.callNumberComponents.callNumber',
      'item.callNumberComponents.suffix',
      'item.volume',
      'item.enumeration',
      'item.chronology',
      'item.copyNumber',
      'item.contributors',
      'item.location.name',
      'item.instanceId',
      'item.holdingsRecordId',
      'itemId',
    ],
  }
};

export default settings;
