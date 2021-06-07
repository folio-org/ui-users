import React from 'react';
import { act, render } from '@testing-library/react';

import '../../../test/jest/__mock__';
import { server, rest } from '../../../test/jest/testServer';
import CheckDeleteUserModal from './CheckDeleteUserModal';

// const onCloseModal = jest.fn();
const deleteUser = jest.fn();
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
  test('check opent transactions', async () => {
    server.use(
      rest.get(
        // hasNoOpenTransactions
        'https://folio-testing-okapi.dev.folio.org/bl-users/by-id/74d6a937-c17d-4045-b294-ab7458988a33/open-transactions',
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.body({
            'userId' : '74d6a937-c17d-4045-b294-ab7458988a3',
            'hasOpenTransactions' : false,
            'loans' : 0,
            'requests' : 0,
            'feesFines' : 0,
            'proxies' : 0,
            'blocks' : 0
          }));
        }
      )
    );
    renderCheckDeleteUserModal();
    expect(document.querySelector('#delete-user-modal')).toBeInTheDocument();
    expect(document.querySelector('#open-transactions-modal')).toBeInTheDocument();
  });

  // describe('render CheckDeleteUserModal', () => {
  //   beforeEach(() => {
  //     renderCheckDeleteUserModal();
  //   });
  //   test('modal is rendered', async () => {
  //     expect(document.querySelector('#delete-user-modal')).toBeInTheDocument();
  //   });
  //   test('modal is rendered', async () => {
  //     expect(document.querySelector('#open-transactions-modal')).toBeInTheDocument();
  //   });
  //   // it('should display name', () => {
  //   //   expect(screen.getByLabelText('Are you sure you want to delete this user rick, psych?')).toBeInTheDocument();
  //   // });
  // });
});
