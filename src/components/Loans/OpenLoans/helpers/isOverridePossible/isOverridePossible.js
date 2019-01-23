import overridePossibleMessages from './overridePossibleMessages';

export default (errorMessage) => {
  return overridePossibleMessages.reduce((data, { message, showDueDatePicker }) => {
    if (errorMessage.includes(message)) {
      if (showDueDatePicker) {
        data.autoNewDueDate = false;
      }

      // eslint-disable-next-line no-param-reassign
      data.overridable = true;
    }

    return data;
  }, {
    overridable: false,
    autoNewDueDate: true,
  });
};
