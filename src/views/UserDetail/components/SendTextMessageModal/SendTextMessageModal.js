import { Button, Modal, ModalFooter, TextArea } from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';
import { Field } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { count } from 'sms-length';

function SendTextMessageModal({ handleSubmit, invalid, submitting, values, onCloseModal }) {
  const intl = useIntl();

  return (
    <Modal
      wrappingElement="form"
      onSubmit={handleSubmit}
      id="send-text-message-modal"
      data-test-send-text-message-modal
      open
      label={intl.formatMessage({ id: 'ui-users.details.sendTextMessage.modal.title' })}
      footer={
        <ModalFooter>
          <Button
            type="submit"
            disabled={invalid || submitting}
            buttonStyle="primary"
            id="send-text-message-button"
          >
            <FormattedMessage id="ui-users.details.sendTextMessage.modal.confirmButton" />
          </Button>
          <Button id="close-send-text-message-button" onClick={onCloseModal}>
            <FormattedMessage id="ui-users.cancel" />
          </Button>
        </ModalFooter>
      }
    >
      <FormattedMessage id="ui-users.details.sendTextMessage.modal.info" />

      <Field
        name="message"
        component={TextArea}
        label={<FormattedMessage id="ui-users.details.sendTextMessage.modal.message.label" />}
        required
        endControl={
          <FormattedMessage
            id="ui-users.details.sendTextMessage.modal.message.characterDisplay"
            values={count(values.message || '')}
          />
        }
      />
    </Modal>
  );
}

export default stripesFinalForm({
  destroyOnUnregister: true,
  subscription: {
    invalid: true,
    submitting: true,
    values: true,
  },
  validate: ({ message }) => {
    const errors = {};

    if (!message || message.trim() === '') {
      errors.message = (
        <FormattedMessage id="ui-users.details.sendTextMessage.modal.message.required" />
      );
    }

    return errors;
  },
})(SendTextMessageModal);
