import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
import '../../../../../test/jest/__mock__';
import userEvent from '@testing-library/user-event';
import { useStripes } from '@folio/stripes/core';
import { StripesContext } from '@folio/stripes-core/src/StripesContext';
// import { server, rest } from '../../../../../test/jest/testServer';
import OpenTransactionModal from './OpenTransactionModal';

const username = 'rick, psych';
// const userId = '74d6a937-c17d-4045-b294-ab7458988a33';

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

const renderOpenTransactionModal = (stripes) => {
  return act(() => {
    render(
      <StripesContext.Provider value={stripes}>
        <OpenTransactionModal
          username={username}
          openTransactions={openTransactions}
          onCloseModal={onCloseModal}
          open
        />
      </StripesContext.Provider>
    );
  });
};

describe('render OpenTransactionModal', () => {
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
    // it('should display name', () => {
    //   expect(screen.getByLabelText('Are you sure you want to delete this user rick, psych?')).toBeInTheDocument();
    // });
  });
});

describe('click button', () => {
  let stripes;
  beforeEach(() => {
    beforeEach(() => {
      stripes = useStripes();
    });
  });

  test('should call closeModal', async () => {
    renderOpenTransactionModal(stripes);

    const heading = screen.queryByRole('heading', { name: 'ui-users.details.openTransactions' });
    expect(heading).toBeVisible();

    const cancel = screen.getByRole('button', { name: 'ui-users.okay' });
    userEvent.click(cancel);

    // TODO: expected result:
    await waitFor(() => expect(heading).not.toBeVisible());
    expect(onCloseModal).toHaveBeenCalled();
  });
});
