import React from 'react';
import { act, render } from '@testing-library/react'; // screen
// import { MemoryRouter } from 'react-router-dom';
// import { useStripes } from '@folio/stripes/core';
import '../../../../../test/jest/__mock__';
// import { server, rest } from '../../../../../test/jest/testServer';
import OpenTransactionModal from './OpenTransactionModal';

const onCloseModal = jest.fn();
const username = 'rick, psych';
// const userId = '74d6a937-c17d-4045-b294-ab7458988a33';

// const fakeStripes = {
//   okapi: {
//     url: '',
//     tenant: 'diku',
//   },
//   store: {
//     getState: () => ({
//       okapi: {
//         token: 'abc',
//       },
//     }),
//     dispatch: () => {},
//     subscribe: () => {},
//     replaceReducer: () => {},
//   },
// };

// const fakeHistory = {
//   history: {
//     push: jest.fn()
//   }
// };

const openTransactions = {
  'userId' : 'a94a8a9b-3aa6-4999-be67-c065ef874602',
  'hasOpenTransactions' : true,
  'loans' : 0,
  'requests' : 0,
  'feesFines' : 0,
  'proxies' : 0,
  'blocks' : 2
};

const renderOpenTransactionModal = () => {
  return act(() => {
    render(
      <OpenTransactionModal
        username={username}
        openTransactions={openTransactions}
        onCloseModal={onCloseModal}
        open
      />
      // <MemoryRouter>
      //   <OpenTransactionModal
      //     username={username}
      //     openTransactions={openTransactions}
      //     onCloseModal={onCloseModal}
      //     open
      //   />
      // </MemoryRouter>
    );
  });
};

describe('render OpenTransactionModal', () => {
  // let stripes;

  // beforeEach(() => {
  //   stripes = useStripes();
  // });

  describe('render OpenTransactionModal', () => {
    beforeEach(() => {
      renderOpenTransactionModal();
    });
    test('DeleteUserModal should be not present', async () => {
      expect(document.querySelector('#delete-user-modal')).not.toBeInTheDocument();
    });
    test('OpenTransactionsModal should be present', async () => {
      expect(document.querySelector('#open-transactions-modal')).toBeInTheDocument();
    });
    // test('xxx button should be present', async () => {
    //   expect(document.querySelector('#close-open-transactions-button')).toBeInTheDocument();
    // });
    // it('should display name', () => {
    //   expect(screen.getByLabelText('Are you sure you want to delete this user rick, psych?')).toBeInTheDocument();
    // });
  });
});
