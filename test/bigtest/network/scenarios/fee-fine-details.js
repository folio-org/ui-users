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
  const owner = server.create('owner', { servicePointOwner: [{ value: 1, label: 'Test Point' }] });
  server.create('payment', {
    nameMethod: 'visa',
    ownerId: owner.id,
  });
  const feeFine = server.create('feefine', {
    feeFineType: 'type',
    ownerId: owner.id,
    defaultAmount: 10
  });
  server.create('waife', { nameReason : 'waiveReason' });
  server.create('transfer', { accountName : 'transferAccount', ownerId: owner.id });
  server.create('refund', { nameReason: 'Overpaid' });
  server.createList('account', 3, {
    userId: user.id,
    ownerId: owner.id
  });
  const openAccount = server.create('account', {
    userId: user.id,
    status: {
      name: 'Open',
    },
    paymentStatus : {
      name : 'Paid partially'
    },
    amount: 600,
    remaining: 500,
    loanId: loan.id,
    ownerId: owner.id,
    feeFineType : feeFine.feeFineType,
    feeFineOwner : owner.owner,
    feeFineId: feeFine.id
  });
  server.create('account', {
    userId: user.id,
    status: {
      name: 'Closed',
    },
    amount: 0,
    remaining: 0
  });
  server.create('feefineaction', {
    accountId: openAccount.id,
    amountAction: 100,
    balance: 500,
    userId: user.id,
    typeAction: openAccount.paymentStatus.name,
  });
  server.create('check-pay', {
    accountId: openAccount.id,
    amount: '500.00',
    allowed: true,
    remainingAmount: '0.00'
  });
  server.get('/payments');
  server.get('/waives');
  server.get('/transfers');
  server.get('/refunds');
  server.get('/accounts');
  server.get('/accounts/:id', (schema, request) => {
    return schema.accounts.find(request.params.id).attrs;
  });
  server.get('/feefineactions');
  server.get('/loans');

  server.post('/loans', (schema, request) => {
    const body = JSON.parse(request.requestBody);

    return schema.feefineactions.create(body);
  });

  server.get('/loans', (schema, request) => {
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

  server.get('/loans/:id', (schema, request) => {
    return schema.loans.find(request.params.id);
  });
};
