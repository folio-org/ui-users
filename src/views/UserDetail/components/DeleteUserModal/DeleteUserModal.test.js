import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StripesContext } from '@folio/stripes-core/src/StripesContext';

import '../../../../../test/jest/__mock__';
import DeleteUserModal from './DeleteUserModal';

const deleteUser = jest.fn();
const onCloseModal = jest.fn();
const username = 'rick, psych';
const userId = '74d6a937-c17d-4045-b294-ab7458988a33';

const fakeStripes = {
  okapi: {
    url: '',
    tenant: 'diku',
  },
  store: {
    getState: () => ({
      okapi: {
        token: 'abc',
      },
    }),
    dispatch: () => {},
    subscribe: () => {},
    replaceReducer: () => {},
  },
};

const renderDeleteUserModal = () => {
  return act(() => {
    render(
      <StripesContext.Provider value={fakeStripes}>
        <MemoryRouter>
          <DeleteUserModal
            username={username}
            userId={userId}
            deleteUser={deleteUser}
            onCloseModal={onCloseModal}
          />
        </MemoryRouter>
      </StripesContext.Provider>
    );
  });
};

describe('render DeleteUserModal', () => {
  beforeEach(() => {
    renderDeleteUserModal();
  });
  test('DeleteUserModal should be present', async () => {
    expect(document.querySelector('#delete-user-modal')).toBeInTheDocument();
    const heading = screen.queryByRole('heading', {
      name: 'ui-users.details.checkDelete',
    });
    expect(heading).toBeVisible();
  });
  test('OpenTransactionsModal should not be present', async () => {
    expect(document.querySelector('#open-transactions-modal')).not.toBeInTheDocument();
  });
  test('Buttons should be present', () => {
    expect(screen.getByRole('button', { name: 'ui-users.no' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ui-users.yes' })).toBeInTheDocument();
  });
});

describe('click buttons', () => {
  beforeEach(() => {
    renderDeleteUserModal({ deleteUser, onCloseModal });
  });

  it('should call deleteUser', () => {
    userEvent.click(screen.getByRole('button', { name: 'ui-users.yes' }));
    expect(deleteUser).toHaveBeenCalled();
  });
  test('should call onCloseModal', async () => {
    userEvent.click(screen.getByRole('button', { name: 'ui-users.no' }));
    await waitFor(() => expect(onCloseModal).toHaveBeenCalled());
  });
});
