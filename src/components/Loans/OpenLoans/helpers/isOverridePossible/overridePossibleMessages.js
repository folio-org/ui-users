export default [
  {
    message: 'loan is not renewable',
    showDueDatePicker: true,
    shouldBeSingle: false,
  },
  {
    message: 'item is not loanable',
    showDueDatePicker: true,
    shouldBeSingle: false,
  },
  {
    message: 'renewal date falls outside of date ranges in fixed loan policy',
    showDueDatePicker: true,
    shouldBeSingle: false,
  },
  {
    message: 'items cannot be renewed when there is an active recall request',
    showDueDatePicker: false,
    shouldBeSingle: true,
  },
  {
    message: 'loan at maximum renewal number',
    showDueDatePicker: false,
    shouldBeSingle: false,
  },
  {
    message: 'renewal date falls outside of date ranges in rolling loan policy',
    showDueDatePicker: false,
    shouldBeSingle: false,
  },
];
