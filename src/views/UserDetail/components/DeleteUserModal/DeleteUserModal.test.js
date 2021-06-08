import React from 'react';
import { act, render } from '@testing-library/react'; // screen, waitFor
// import userEvent from '@testing-library/user-event';

import '../../../../../test/jest/__mock__';
import DeleteUserModal from './DeleteUserModal';

const deleteUser = jest.fn();
const closeModal = jest.fn();
const username = 'rick, psych';
const userId = '74d6a937-c17d-4045-b294-ab7458988a33';

const renderDeleteUserModal = () => {
  return act(() => {
    render(
      <DeleteUserModal
        username={username}
        userId={userId}
        deleteUser={deleteUser}
        onCloseModal={closeModal}
      />
    );
  });
};

describe('render DeleteUserModal', () => {
  beforeEach(() => {
    renderDeleteUserModal();
  });
  test('DeleteUserModal should be present', async () => {
    expect(document.querySelector('#delete-user-modal')).toBeInTheDocument();
  });
  test('OpenTransactionsModal should not be present', async () => {
    expect(document.querySelector('#open-transactions-modal')).not.toBeInTheDocument();
  });
  // test('Delete button should be present', async () => {
  //   // expect(document.querySelector('#close-delete-user-button')).toBeInTheDocument();
  //   expect(document.querySelector('ui-users.details.checkDelete')).toBeInTheDocument();
  // });
  // it('should display name', () => {
  //   expect(screen.getByLabelText('Are you sure you want to delete this user rick, psych?')).toBeInTheDocument();
  // });
  // test('click ok', async () => {
  //   const heading = screen.queryByRole('heading', {
  //     name: 'ui-users.details.checkDelete',
  //   });
  //   expect(heading).toBeVisible();

  //   const cancel = screen.getByRole('button', {
  //     name: 'OK',
  //   });
  //   userEvent.click(cancel);
  //   await waitFor(() => expect(heading).not.toBeVisible());
  // });
});
