import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StripesContext } from '@folio/stripes-core/src/StripesContext';

import '__mock__';
import OpenTransactionModal from './OpenTransactionModal';

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

const username = 'rick, psych';

const openTransactions = {
  'userId' : 'a94a8a9b-3aa6-4999-be67-c065ef874602',
  'hasOpenTransactions' : true,
  'loans' : 0,
  'requests' : 0,
  'feesFines' : 0,
  'proxies' : 0,
  'blocks' : 2
};

const onCloseModal = jest.fn();

const renderOpenTransactionModal = () => {
  return act(() => {
    render(
      <StripesContext.Provider value={fakeStripes}>
        <MemoryRouter>
          <OpenTransactionModal
            username={username}
            openTransactions={openTransactions}
            onCloseModal={onCloseModal}
            open
          />
        </MemoryRouter>
      </StripesContext.Provider>
    );
  });
};

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
  test('Button should be present', () => {
    expect(screen.getByRole('button', { name: 'ui-users.okay' })).toBeInTheDocument();
  });
  test('clicking ok button should call closeModal', async () => {
    const heading = screen.queryByRole('heading', { name: 'ui-users.details.openTransactions' });
    expect(heading).toBeVisible();

    const cancel = screen.getByRole('button', { name: 'ui-users.okay' });
    userEvent.click(cancel);

    expect(onCloseModal).toHaveBeenCalled();
  });
});
