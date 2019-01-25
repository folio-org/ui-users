import overridePossibleMessages from './overridePossibleMessages';

export default (errorMessage) => {
  const data = {
    overridable: false,
    autoNewDueDate: true,
  };

  overridePossibleMessages.forEach(({ message, showDueDatePicker }) => {
    if (errorMessage.includes(message)) {
      if (showDueDatePicker) {
        data.autoNewDueDate = false;
      }

      data.overridable = true;
    }
  });

  return data;
};
