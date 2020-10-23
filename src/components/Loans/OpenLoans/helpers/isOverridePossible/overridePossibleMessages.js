export default [
  {
    message: 'loan is not renewable',
    showDueDatePicker: true,
  },
  {
    message: 'item is not loanable',
    showDueDatePicker: true,
  },
  {
    message: 'item is Declared lost',
    showDueDatePicker: false,
  },
  {
    message: 'item is Aged to lost',
    showDueDatePicker: false,
  },
  {
    message: 'renewal date falls outside of date ranges in fixed loan policy',
    showDueDatePicker: true,
  },
  {
    message: 'items cannot be renewed when there is an active recall request',
    showDueDatePicker: false,
  },
  {
    message: 'loan at maximum renewal number',
    showDueDatePicker: false,
  },
  {
    message: 'renewal date falls outside of date ranges in the loan policy',
    showDueDatePicker: true,
  },
  {
    message: 'renewal would not change the due date',
    showDueDatePicker: true,
  },
];
