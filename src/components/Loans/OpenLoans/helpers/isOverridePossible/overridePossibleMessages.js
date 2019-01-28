export default [
  {
    message: 'loan is not renewable',
    showDueDatePicker: true,
  },
  {
    message: 'loan has reached its maximum number of renewals',
    showDueDatePicker: false,
  },
  {
    message: 'renewal date falls outside of the date ranges in the limit schedule of rolling loan policy',
    showDueDatePicker: false,
  },
  {
    message: 'renewal date falls outside of the date ranges in the fixed schedule of fixed loan policy',
    showDueDatePicker: true,
  },
];
