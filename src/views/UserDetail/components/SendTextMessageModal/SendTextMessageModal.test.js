import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SendTextMessageModal from './SendTextMessageModal';

const onCloseModal = jest.fn();
const onSubmit = jest.fn();

const renderSendTextMessageModal = (props) => render(
  <MemoryRouter>
    <SendTextMessageModal onCloseModal={onCloseModal} onSubmit={onSubmit} {...props} />
  </MemoryRouter>,
);

describe('SendTextMessageModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the modal', () => {
    renderSendTextMessageModal();
    expect(document.querySelector('#send-text-message-modal')).toBeInTheDocument();
  });

  test('renders the modal title', () => {
    renderSendTextMessageModal();
    expect(screen.getByText('ui-users.details.sendTextMessage.modal.title')).toBeTruthy();
  });

  test('submit button is disabled when message is empty', () => {
    renderSendTextMessageModal();
    expect(document.querySelector('#send-text-message-button')).toBeDisabled();
  });

  test('submit button is disabled when message is blank space', async () => {
    renderSendTextMessageModal({ initialValues: { message: '   ' } });
    expect(document.querySelector('#send-text-message-button')).toBeDisabled();
  });

  test('submit button is enabled when message is not empty', async () => {
    renderSendTextMessageModal({ initialValues: { message: 'test' } });
    expect(document.querySelector('#send-text-message-button')).not.toBeDisabled();
  });
});
