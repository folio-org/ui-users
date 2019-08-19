import overridePossibleMessages from './overridePossibleMessages';

const data = {
  overridable: false,
  autoNewDueDate: true,
};

const isOverridableMessage = (errorMessage) => {
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
  const errorMessages = text.split(',');

  data.overridable = errorMessages.every((errorMessage) => isOverridableMessage(errorMessage));

  return data;
};
