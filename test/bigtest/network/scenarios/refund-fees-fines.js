/* istanbul ignore file */
export default (server) => {
  const user = server.create('user', { id: 'user1' });
  const owner = server.create('owner');
  server.create('payment', {
    nameMethod: 'visa',
    ownerId: owner.id,
  });
  const feeFine = server.create('feefine', { ownerId: owner.id });
  server.create('waife', { nameReason : 'waiveReason' });
  server.create('refund', { nameReason: 'Overpaid' });
  const partiallyPaidAccount1 = server.create('account', {
    id: 'r1',
    userId: user.id,
    status: {
      name: 'Open',
    },
    paymentStatus : {
      name : 'Paid partially'
    },
    amount: 500,
    remaining: 100,
    ownerId: owner.id,
    feeFineType : feeFine.feeFineType,
    feeFineOwner : owner.owner,
    feeFineId: feeFine.id
  });
  const partiallyPaidAccount2 = server.create('account', {
    id: 'r2',
    userId: user.id,
    status: {
      name: 'Open',
    },
    paymentStatus : {
      name : 'Paid partially'
    },
    amount: 400,
    remaining: 300,
    ownerId: owner.id,
    feeFineType : feeFine.feeFineType,
    feeFineOwner : owner.owner,
    feeFineId: feeFine.id
  });
  const partiallyWaivedAccount = server.create('account', {
    id: 'r3',
    userId: user.id,
    status: {
      name: 'Open',
    },
    paymentStatus : {
      name : 'Waived partially'
    },
    amount: 300,
    remaining: 200,
    ownerId: owner.id,
    feeFineType : feeFine.feeFineType,
    feeFineOwner : owner.owner,
    feeFineId: feeFine.id
  });
  server.create('feefineaction', {
    accountId: partiallyPaidAccount1.id,
    amountAction: 600,
    balance: 600,
    userId: user.id,
    typeAction: feeFine.feeFineType,
    dateAction: '2019-04-22T22:07:07.343+0000',
  });
  server.create('check-pay', {
    accountId: partiallyPaidAccount1.id,
    amount: '100.00',
    allowed: true,
    remainingAmount: '500.00'
  });
  server.create('feefineaction', {
    accountId: partiallyPaidAccount1.id,
    amountAction: 100,
    balance: 500,
    userId: user.id,
    typeAction: 'Paid partially',
    dateAction: '2019-04-22T22:08:07.343+0000',
  });
  server.create('feefineaction', {
    accountId: partiallyPaidAccount2.id,
    amountAction: 600,
    balance: 600,
    userId: user.id,
    typeAction: feeFine.feeFineType,
    dateAction: '2019-04-22T22:09:07.343+0000',
  });
  server.create('check-pay', {
    accountId: partiallyPaidAccount2.id,
    amount: '200.00',
    allowed: true,
    remainingAmount: '400.00'
  });
  server.create('feefineaction', {
    accountId: partiallyPaidAccount2.id,
    amountAction: 200,
    balance: 400,
    userId: user.id,
    typeAction: 'Paid partially',
    dateAction: '2019-04-22T22:11:07.343+0000',
  });
  server.create('feefineaction', {
    accountId: partiallyWaivedAccount.id,
    amountAction: 700,
    balance: 700,
    userId: user.id,
    typeAction: feeFine.feeFineType,
    dateAction: '2019-04-22T22:10:07.343+0000',
  });
  server.create('feefineaction', {
    accountId: partiallyWaivedAccount.id,
    amountAction: 100,
    balance: 500,
    userId: user.id,
    typeAction: 'Paid partially',
    dateAction: '2019-04-22T22:12:07.343+0000',
  });
  server.create('check-waive', {
    accountId: partiallyWaivedAccount.id,
    amount: '200.00',
    allowed: true,
    remainingAmount: '300.00'
  });
  server.create('feefineaction', {
    accountId: partiallyWaivedAccount.id,
    amountAction: 200,
    balance: 300,
    userId: user.id,
    typeAction: 'Waived partially',
    dateAction: '2019-04-22T22:13:07.343+0000',
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
};
