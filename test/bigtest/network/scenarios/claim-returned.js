/* istanbul ignore file */
import CQLParser from '../cql';

export default (server) => {
  const user = server.create('user', { id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd' });
  server.create('account', { userId: user.id });
  const loanClaimedReturned = this.server.create('loan', {
    status: { name: 'Open' },
    loanPolicyId: 'test',
    action: 'Declared Lost',
    item: { status: { name: 'Declared Lost' } },
    itemStatus: 'Declared Lost',
    claimedReturnedDate: new Date().toISOString(),
  });

  this.server.create('user', { id: loanClaimedReturned.userId });
  this.server.create('loanaction', {
    loan: {
      ...loanClaimedReturned.attrs,
    },
  });

  this.server.get('/accounts', () => {
    const accounts = [{
      id:'b7def5a0-4139-4abb-ba75-7f5eb02c0354',
      userId: loanClaimedReturned.userId,
      status: {
        name: 'Open',
      },
      paymentStatus: {
        name: 'Transferred partially',
      },
      amount: 180,
      balance: 20,
      feeFineType: 'Lost item fee',
      loanId: loanClaimedReturned.id,
    }, {
      id:'b7def5a0-4139-4abb-ba75-7f5eb02c0355',
      userId: loanClaimedReturned.userId,
      status: {
        name: 'Open',
      },
      paymentStatus: {
        name: 'Transferred partially',
      },
      amount: 180,
      balance: 20,
      feeFineType: 'Lost item processing fee',
      loanId: loanClaimedReturned.id,
    }];
    return { accounts };
  });
  server.get('/accounts', (schema, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');

    if (cqlQuery != null) {
      const cqlParser = new CQLParser();
      cqlParser.parse(cqlQuery);

      if (cqlParser.tree.term) {
        return schema.feefineactions.where({
          accountId: cqlParser.tree.term
        });
      }
    }

    return schema.feefineactions.all();
  });

  server.get('/accounts/:id', (schema, request) => {
    return schema.accounts.find(request.params.id).attrs;
  });

  server.createList('feefineaction', 4, { userId: user.id });
  server.create('feefineaction', {
    userId: user.id,
    transactionInformation: 'Refunded to Community',
    typeAction: 'Refunded fully-Claim returned',
    accountId: 'b7def5a0-4139-4abb-ba75-7f5eb02c0354',
    amount: 100,
    remaining: 100,
    loanId: loan.id,
  });
  server.create('feefineaction', {
    userId: user.id,
    transactionInformation: 'Refunded to Community',
    typeAction: 'Credited fully-Claim returned',
    accountId: 'b7def5a0-4139-4abb-ba75-7f5eb02c0354',
    amount: 0,
    remaining: 0
  });
  server.create('feefineaction', {
    userId: user.id,
    transactionInformation: 'Refunded to Community',
    typeAction: 'Refunded fully-Claim returned',
    accountId: '748f4415-49c7-459c-8c14-ebfb07d99d9f',
    amount: 100,
    remaining: 100,
    loanId: loan.id,
  });
  server.create('feefineaction', {
    userId: user.id,
    transactionInformation: 'Refunded to Community',
    typeAction: 'Credited fully-Claim returned',
    accountId: '748f4415-49c7-459c-8c14-ebfb07d99d9f',
    amount: 0,
    remaining: 0
  });
  server.get('/feefineaction');
};
