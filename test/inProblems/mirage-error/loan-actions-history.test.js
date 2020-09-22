import { App } from '@bigtest/interactor';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

export default test('loans actions history', { permission: [
  'manualblocks.collection.get',
  'circulation.loans.collection.get'
] })
  .step('seed data', async () => {
    const openLoan = store.create('loan', {
      status: { name: 'Open' },
      loanPolicyId: 'test',
      overdueFinePolicyId: 'test',
      lostItemPolicyId: 'test',
      overdueFinePolicy: {
        'name': 'One Hour1'
      },
      lostItemPolicy: {
        'name': 'One Hour2'
      },
      item: {
        callNumberComponents: {
          prefix: 'prefix',
          callNumber: 'callNumber',
          suffix: 'suffix',
        },
        enumeration: 'enumeration',
        chronology: 'chronology',
        volume: 'volume',
      },
    });
    store.createList('loanaction', 5, { loan: { ...openLoan.attrs } }); // 🧹 error
    store.createList('request', 2, { itemId: openLoan.itemId });
    return { openLoan };
  })
  .child('loans without fees/fines', test => test
    .step('visit /users/openLoan.userId/loans/view/openLoad.id', async ({ openLoan }) => {
      await App.visit(`/users/${openLoan.userId}/loans/view/${openLoan.id}`);
    })
  )

