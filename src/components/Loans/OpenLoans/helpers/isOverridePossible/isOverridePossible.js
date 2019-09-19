import overridePossibleMessages from './overridePossibleMessages';

const isOverridableMessage = (errorMessage, data) => {
  for (const { message, showDueDatePicker } of overridePossibleMessages) {
    const canBeOverridden = errorMessage.includes(message);

    if (canBeOverridden) {
      if (showDueDatePicker) {
        data.autoNewDueDate = false;
      }

      return true;
    }
  }

  return false;
};

export default (text) => {
  const data = {
    overridable: false,
    autoNewDueDate: true,
  };

  const errorMessages = text.split(',');

  data.overridable = errorMessages.every((errorMessage) => isOverridableMessage(errorMessage, data));

  return data;
};
