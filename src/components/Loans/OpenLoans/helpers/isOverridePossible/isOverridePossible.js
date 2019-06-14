import overridePossibleMessages from './overridePossibleMessages';

const data = {
  overridable: false,
  autoNewDueDate: true,
};

const isOverridableMessage = (errorMessage, errorsAmount) => {
  for (const { message, showDueDatePicker, shouldBeSingle } of overridePossibleMessages) {
    const canBeOverridden = errorMessage.includes(message) && (!shouldBeSingle || errorsAmount === 1);

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

  data.overridable = errorMessages.every((errorMessage) => isOverridableMessage(errorMessage, errorMessages.length));

  return data;
};
