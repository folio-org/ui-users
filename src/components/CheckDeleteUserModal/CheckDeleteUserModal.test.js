import React from 'react';
import { act, render } from '@testing-library/react';

import '../../../test/jest/__mock__';
import CheckDeleteUserModal from './CheckDeleteUserModal';

// const onCloseModal = jest.fn();
const deleteUser = jest.fn();
const username = 'rick, psych';
const userId = 'rick, psych';
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
const fakeHistory = {
  history: {
    push: jest.fn()
  }
};

const renderCheckDeleteUserModal = () => {
  return act(() => {
    render(
      <CheckDeleteUserModal
        username={username}
        userId={userId}
        stripes={fakeStripes}
        deleteUser={deleteUser}
        history={fakeHistory}
      />
    );
  });
};

describe('CheckDeleteUserModal', () => {
  describe('render CheckDeleteUserModal', () => {
    beforeEach(() => {
      renderCheckDeleteUserModal();
    });
    test('modal is rendered', async () => {
      expect(document.querySelector('#delete-user-modal')).toBeInTheDocument();
    });
    test('modal is rendered', async () => {
      expect(document.querySelector('#open-transactions-modal')).toBeInTheDocument();
    });
    // it('should display name', () => {
    //   expect(screen.getByLabelText('Are you sure you want to delete this user rick, psych?')).toBeInTheDocument();
    // });
  });
});
