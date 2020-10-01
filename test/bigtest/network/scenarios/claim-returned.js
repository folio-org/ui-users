/* istanbul ignore file */
import CQLParser from '../cql';

export default (server) => {
  const user = server.create('user', { id: 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd' });
  server.create('account', { userId: user.id });
  const loan = server.create('loan', {
    id: '8e9f211b-6024-4828-8c14-ace39c6c2863',
    userId: user.id,
    overdueFinePolicyId: () => 'a6130d37-0468-48ca-a336-c2bde575768d',
    lostItemPolicyId: () => '48a3115d-d476-4582-b6a8-55c09eed7ec7',
    overdueFinePolicy: {
      name: () => 'Overdue Fine Policy name',
    },
    lostItemPolicy: {
      name: () => 'Lost Item Policy name',
    },
  });
  server.createList('account', 2, { userId: user.id });
  server.create('account', {
    id:'b7def5a0-4139-4abb-ba75-7f5eb02c0354',
    userId: user.id,
    status: {
      name: 'Open',
    },
    paymentStatus: {
      name: 'Suspended Claim Returned',
    },
    amount: 100,
    remaining: 100,
    feeFineType: 'Lost item fee',
    loanId: loan.id,
  });
  server.create('account', {
    id: '748f4415-49c7-459c-8c14-ebfb07d99d9f',
    userId: user.id,
    status: {
      name: 'Open',
    },
    paymentStatus: {
      name: 'Suspended Claim Returned',
    },
    feeFineType: 'Lost item processing fee',
    amount: 0,
    remaining: 0
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