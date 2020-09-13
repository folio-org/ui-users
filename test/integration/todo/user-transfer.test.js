// /* eslint-disable */
// import { App } from '@bigtest/interactor';
// import test from '../helpers/base-steps/simulate-server';
// import { store, routes } from '../helpers/server';
// import CQLParser from '../network/cql';

// import Table from '../interactors/Table';

// export default test('Transfer user fines', 
//   { permissions: [] }, { curServicePoint: { id: 1 } })
//   .step('seed data', async () => {
//     const user = store.create('user', { id: '1ad737b0-d847-11e6-bf26-cec0c932ce02' });
//     store.createList('owner', 5);
//     store.createList('feefine', 5);
//     store.createList('transfer', 5);
//     const account = store.create('account', { userId: user.id });
//     store.createList('feefineaction', 5, { accountId: account.id });
//     store.createList('account', 3, { userId: user.id });
//     store.create('account', {
//       userId: user.id,
//       status: {
//         name: 'Closed'
//       },
//       amount: 0,
//       remaining: 0
//     });
//     store.create('comment');
//     store.createList('waiver', 4);
  
//     return { user };
//   })
//   .step('query routes', async () => {
//     routes.get('/accounts');
//     routes.get('/accounts/:id', (schema, request) => {
//       return schema.accounts.find(request.params.id).attrs;
//     });
//     routes.put('/accounts/:id', ({ accounts }, request) => {
//       const matching = accounts.find(request.params.id);
//       const body = JSON.parse(request.requestBody);
//       return matching.update(body);
//     });
//     routes.get('/users');
//     routes.get('/owners');
//     routes.get('/feefines');
//     routes.get('/comments');
//     routes.get('/feefineactions');
//     routes.get('/waives');
//     routes.get('/transfers');
  
//     routes.post('/transfers', (schema, request) => {
//       const body = JSON.parse(request.requestBody);
//       return schema.transfers.create(body);
//     });
  
//     routes.put('/transfers/:id', ({ transfers }, request) => {
//       const matching = transfers.find(request.params.id);
//       const body = JSON.parse(request.requestBody);
//       return matching.update(body);
//     });
  
//     routes.post('/feefineactions', (schema, request) => {
//       const body = JSON.parse(request.requestBody);
//       return schema.feefineactions.create(body);
//     });
  
//     routes.get('/feefineactions', (schema, request) => {
//       const url = new URL(request.url);
//       const cqlQuery = url.searchParams.get('query');
//       if (cqlQuery != null) {
//         const cqlParser = new CQLParser();
//         cqlParser.parse(cqlQuery);
//         if (cqlParser.tree.term) {
//           return schema.feefineactions.where({
//             accountId: cqlParser.tree.term
//           });
//         }
//       }
//       return schema.feefineactions.all();
//     });
  
//     routes.get('/feefineactions/:id', (schema, request) => {
//       return schema.feefineactions.find(request.params.id);
//     });
//   })
//   .step('visit user-details: accounts', ({ user }) => App.visit(`users/${user.id}/accounts/all`))
//   .assertion(Table('list-accounts-history-view-feesfines', { dataRowCount: 5 }).exists()) 
//   // .child('open accounts', test => test
//   //   .step(Link('Open').click())
//   //   .assertion(able('list-accounts-history-view-feesfines', { dataRowCount: 4 }).exists())
//   //   .assertion(Table('list-accounts-history-view-feesfines').find(HeaderRow('', { columnRowCount: 14 })).exists())
//   //   .child('transfer prompt', test => test
//   //     .step('select all fee/fine', async () => {
//   //       await Checkbox.findByName('check-all').click();
//   //     })
//   //     .step('click on transfer button', async () => {
//   //       await Button.findById('open-closed-all-transfer-button').click();
//   //     })
//   //     .child('cancel the transfer', test => test
//   //       .step('click on the cancel button', async () => {
//   //         await Button('Cancel').click();
//   //       })
//   //       .assertion('transfer modal is absent', async () => {
//   //         await Div.findById('transfer-modal').absent();
//   //       })
//   //     )
//   //   )
//   //   // .child('add (complete) a transfer') //wip
        
//   // )
