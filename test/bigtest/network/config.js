// eslint-disable-next-line jsx-a11y/label-has-associated-control
import CQLParser from './cql';

// typical mirage config export
// http://www.ember-cli-mirage.com/docs/v0.4.x/configuration/
export default function config() {
  const server = this;

  // okapi endpoints
  this.get('/_/version', () => '0.0.0');

  this.get('/refunds', {
    refunds: [],
    totalRecords: 0
  });

  this.get('_/proxy/tenants/:id/modules', [
    {
      id: 'mod-circulation-16.0.0-SNAPSHOT.253',
      name: 'Circulation Module',
      provides: [
        { id: 'circulation', version: '7.4' },
        { id: 'loan-policy-storage', version: '7.4' },
      ]
    },
    {
      id: 'mod-users-16.0.1-SNAPSHOT.121',
      name: 'users',
      provides: []
    },
    {
      id: 'mod-feesfines-15.8.0-SNAPSHOT.73',
      name: 'feesfines',
      provides: [{
        id: 'feesfines',
        version: '15.2',
      }]
    }
  ]);

  this.get('/saml/check', {
    ssoEnabled: false
  });

  this.get('/configurations/entries', (schema, request) => {
    if (request.url.includes('custom_fields_label')) {
      return {
        configs: [{
          id: 'tested-custom-field-label',
          module: 'USERS',
          configName: 'custom_fields_label',
          enabled: true,
          value: 'Custom Fields Test',
        }],
      };
    }

    return { configs: [] };
  });
  this.post('/bl-users/login', () => {
    return new Response(
      201,
      {
        'X-Okapi-Token': `myOkapiToken:${Date.now()}`
      }, {
        user: {
          id: 'test',
          username: 'testuser',
          personal: {
            lastName: 'User',
            firstName: 'Test',
            email: 'user@folio.org',
          }
        },
        permissions: {
          permissions: []
        }
      }
    );
  });
  this.get('/groups', {
    'usergroups': [{
      'group': 'alumni_1383',
      'desc': 'Alumni',
      'id': 'group1',
    }, {
      'group': 'alumni_2121',
      'desc': 'Alumni',
      'id': 'group2',
    }, {
      'group': 'alumni_6422',
      'desc': 'Alumni',
      'id': 'group3',
    }, {
      'group': 'faculty',
      'desc': 'Faculty Member',
      'id': 'group4',
    }, {
      'group': 'graduate',
      'desc': 'Graduate Student',
      'id': 'group5',
    }, {
      'group': 'staff',
      'desc': 'Staff Member',
      'id': 'group6',
      'expirationOffsetInDays': 730,
    }, {
      'group': 'undergrad',
      'desc': 'Undergraduate Student',
      'id': 'group7',
    }],
    'totalRecords': 7
  });
  this.get('/addresstypes', {
    'addressTypes': [{
      'addressType': 'Claim',
      'desc': 'Claim Address',
      'id': 'Type1',
    }, {
      'addressType': 'Home',
      'desc': 'Home Address',
      'id': 'Type2',
    }, {
      'addressType': 'Order',
      'desc': 'Order Address',
      'id': 'Type3',
    }, {
      'addressType': 'Payment',
      'desc': 'Payment Address',
      'id': 'Type4',
    }, {
      'addressType': 'Returns',
      'desc': 'Returns Address',
      'id': 'Type5',
    }, {
      'addressType': 'Work',
      'desc': 'Work Address',
      'id': 'Type6',
    }],
    'totalRecords': 6
  });

  this.get('/users', ({ users }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      // get the CQL query param from 'query=' until the amphersand or end of the string
      let query = /query=(\(.*\)|%28.*%29)/.exec(request.url)[1];
      const filterField = 'active';
      const departmentsField = 'departments';
      const usernameField = 'username';
      const lastNameField = 'personal.lastName';
      const barcodeField = 'barcode';
      if (/^%28/.test(query)) {
        query = decodeURIComponent(query);
      }
      cqlParser.parse(query);

      const {
        tree: {
          term,
          field,
        }
      } = cqlParser;

      if (field === filterField) {
        return users.where({
          [filterField]: term === 'true'
        });
      }
      if (field === departmentsField) {
        return users.where({
          [departmentsField]: [term],
        });
      }
      if (field === usernameField) {
        return users.where({
          [usernameField]: term.replace('*', '')
        });
      }
      if (field === lastNameField) {
        return users.where(u => {
          return (u.personal.lastName === term.replace('*', ''));
        });
      }
      if (field === barcodeField) {
        return users.where({
          [barcodeField]: term.replace('*', '')
        });
      }
    }

    return users.all();
  });

  this.get('/users/:id', (schema, request) => {
    return schema.users.find(request.params.id).attrs;
  });

  this.put('/users/:id', (schema, { params, requestBody }) => {
    const data = JSON.parse(requestBody);
    // The active field is not converted to boolean correctly
    // So we do it here manually
    data.active = (data.active === 'true');
    const user = schema.users.find(params.id);

    user.update(data);

    return user.attrs;
  });

  this.get('/proxiesfor', {
    proxiesFor: [],
    totalRecords: 0,
  });

  this.get('/service-points-users', ({ servicePointsUsers }, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');
    const cqlParser = new CQLParser();
    cqlParser.parse(cqlQuery);
    return servicePointsUsers.where({
      userId: cqlParser.tree.term
    });
  });

  this.get('/service-points-users/:id', ({ servicePointsUsers }, request) => {
    return servicePointsUsers.find(request.params.id).attrs;
  });

  this.put('/service-points-users/:id', ({ servicePointsUsers }, request) => {
    return servicePointsUsers.find(request.params.id).attrs;
  });

  this.post('/service-points-users/', (schema, { requestBody }) => {
    const spu = JSON.parse(requestBody);
    return server.create('service-points-user', spu);
  });

  this.get('/service-points', (schema) => {
    return this.serializerOrRegistry.serialize(schema.servicePoints.all());
  });

  this.get('/circulation/loans', function ({ loans }, request) {
    if (request.queryParams.query) {
      const url = new URL(request.url.split('sortby')[0]);
      const query = url.searchParams.get('query');
      const cqlParser = new CQLParser();

      cqlParser.parse(query);

      const {
        tree: {
          term,
          field,
        }
      } = cqlParser;

      if (query.match('claimedReturned')) {
        return loans.where((loan) => {
          return loan.action === 'claimedReturned';
        });
      }

      if (field === 'userId') {
        return loans.where((loan) => {
          return loan.userId === term;
        });
      }
    }

    return this.serializerOrRegistry.serialize(loans.all());
  });

  this.get('/loan-storage/loans/:id', ({ loans }, request) => {
    return loans.find(request.params.id).attrs;
  });

  this.get('loan-storage/loan-history', ({ loanactions }, request) => {
    if (request.queryParams.query) {
      const query = /query=(\(.*\)|%28.*%29)/.exec(request.url)[1];
      const cqlParser = new CQLParser();

      cqlParser.parse(query);

      const {
        tree: {
          term,
          field,
        }
      } = cqlParser;

      if (field === 'loan.id') {
        return loanactions.where((loanaction) => {
          return loanaction.loan.id === term;
        });
      }
    }

    return {
      loansHistory: [],
      totalRecords: 0,
    };
  });

  this.put('/loan-storage/loans/:id', (_, request) => {
    return JSON.parse(request.requestBody);
  });

  this.get('/circulation/requests', function ({ requests }) {
    return this.serializerOrRegistry.serialize(requests.all());
  });

  this.get('/loan-policy-storage/loan-policies', {
    'loanPolicies': [{
      'id': 'test',
      'name': 'Example Loan Policy',
      'description': 'An example loan policy',
      'loanable': true,
      'loansPolicy': {
        'profileId': 'Rolling',
        'period': {
          'duration': 1,
          'intervalId': 'Months'
        },
        'closedLibraryDueDateManagementId': 'KEEP_CURRENT_DATE',
        'gracePeriod': {
          'duration': 7,
          'intervalId': 'Days'
        }
      },
      'renewable': true,
      'renewalsPolicy': {
        'unlimited': true,
        'renewFromId': 'CURRENT_DUE_DATE',
        'differentPeriod': true,
        'period': {
          'duration': 30,
          'intervalId': 'Days'
        }
      }
    }],
    'totalRecords': 1
  });

  this.get('/accounts', {
    accounts: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });

  this.get('/accounts/:id', ({ accounts }, request) => {
    return accounts.find(request.params.id).attrs;
  });

  this.post('/accounts', function (schema, { requestBody }) {
    const acct = JSON.parse(requestBody);
    return server.create('account', acct);
  });

  this.put('/accounts/:id', ({ accounts }, { params, requestBody }) => {
    const account = JSON.parse(requestBody);

    return accounts.find(params.id).update(account);
  });

  this.get('/waives', {
    waivers: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('/payments', {
    payments: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('/comments', {
    comments: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('/feefines', function ({ feefines }, request) {
    if (request.queryParams.query) {
      if (request.queryParams.query.includes('allRecords')) {
        return this.serializerOrRegistry.serialize(feefines.all());
      }
      const query = /query=(\(.*\)|%28.*%29)/.exec(request.url)[1];
      const cqlParser = new CQLParser();

      cqlParser.parse(query);

      const {
        tree: {
          left,
          right,
        }
      } = cqlParser;

      if (left?.field === 'ownerId' || right?.field === 'ownerId') {
        return feefines.where((feefine) => {
          return feefine.ownerId === left.term || feefine.ownerId === right.term;
        });
      }
    }

    return {
      feefines: [],
      totalRecords: 0,
      resultInfo: {
        totalRecords: 0,
        facets: [],
        diagnostics: [],
      },
    };
  });
  this.get('/transfers', {
    transfers: [],
    totalRecords: 0
  });
  this.get('/manualblocks', {
    manualblocks: [],
    totalRecords: 0,
  });
  this.get('/perms/users/:id/permissions', {
    permissionNames: [],
  });
  this.get('/perms/permissions', function ({ permissions }) {
    return this.serializerOrRegistry.serialize(permissions.all());
  });
  this.post('/perms/users/:id/permissions', {
    permissionNames: [],
  });

  this.post('/perms/users/:id/permissions?indexField=userId');

  this.post('/circulation/loans/:loanId/declare-item-lost', []);
  this.post('/circulation/loans/:loanId/claim-item-returned', []);

  this.get('/feefineactions', ({ feefineactions }) => {
    return this.serializerOrRegistry.serialize(feefineactions.all());
  });

  this.post('/feefineactions', (schema, { requestBody }) => {
    const ffAction = JSON.parse(requestBody);
    return server.create('feefineaction', ffAction);
  });

  this.get('/feefines');

  this.get('/owners', ({ owners }) => {
    return this.serializerOrRegistry.serialize(owners.all());
  });

  this.get('/authn/credentials-existence', () => { });

  this.get('/note-types');

  this.post('/note-types', ({ requestBody }) => {
    const noteTypeData = JSON.parse(requestBody);

    return server.create('note-type', noteTypeData);
  });

  this.put('/note-types/:id', ({ noteTypes }, { params, requestBody }) => {
    const noteTypeData = JSON.parse(requestBody);

    return noteTypes.find(params.id).update(noteTypeData);
  });

  this.delete('/note-types/:id', ({ noteTypes }, { params }) => {
    return noteTypes.find(params.id).destroy();
  });

  this.get('/note-links/domain/users/type/:type/id/:id', ({ notes }, { params, queryParams }) => {
    if (queryParams.status === 'all') {
      return notes.all();
    }

    return notes.where((note) => {
      switch (queryParams.status) {
        case 'assigned': {
          return note.links.some(link => {
            return link.type === params.type && link.id === params.id;
          });
        }
        case 'unassigned': {
          return note.links.every(link => {
            return link.type !== params.type || link.id !== params.id;
          });
        }
        default: {
          return false;
        }
      }
    });
  });

  this.put('/note-links/type/:type/id/:id', ({ notes }, { params, requestBody }) => {
    const body = JSON.parse(requestBody);

    body.notes.forEach((note) => {
      const dbNote = notes.find(note.id);
      const links = [...dbNote.links];

      if (note.status === 'ASSIGNED') {
        links.push({
          id: params.id,
          type: params.type,
        });
      } else {
        for (let i = 0; i < links.length; i++) {
          if (links[i].type === params.type && links[i].id === params.id) {
            links.splice(i, 1);
            break;
          }
        }
      }

      dbNote.update({ links });
    });
  });

  this.get('/notes/:id', ({ notes }, { params }) => {
    return notes.find(params.id);
  });

  this.post('/notes', (_, { requestBody }) => {
    const noteData = JSON.parse(requestBody);

    return this.create('note', noteData);
  });

  this.put('/notes/:id', ({ notes, noteTypes }, { params, requestBody }) => {
    const noteData = JSON.parse(requestBody);
    const noteTypeName = noteTypes.find(noteData.typeId).attrs.name;

    return notes.find(params.id).update({
      ...noteData,
      type: noteTypeName,
    });
  });

  this.delete('/notes/:id', ({ notes, noteTypes }, { params }) => {
    const note = notes.find(params.id);
    const noteType = noteTypes.find(note.attrs.typeId);

    noteType.update({
      usage: {
        noteTotal: --noteType.attrs.usage.noteTotal,
      },
    });

    return notes.find(params.id).destroy();
  });

  server.post('/circulation/renew-by-barcode', ({ loans }, { requestBody }) => {
    const { itemBarcode } = JSON.parse(requestBody);

    return loans.findBy({ item: { barcode: itemBarcode } }).attrs;
  }, 200);

  this.get('/perms/users/:id', { id: 'test' });
  this.put('/perms/users/:id', { id: 'test' });

  this.get('/request-preference-storage/request-preference', ({ requestPreferences }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      return requestPreferences.where({
        userId: cqlParser.tree.term
      });
    } else {
      return [];
    }
  });

  this.post('/request-preference-storage/request-preference');

  this.get('/patron-block-conditions/:id', ({ patronBlockConditions }, request) => {
    return patronBlockConditions.find(request.params.id).attrs;
  });

  this.put('/patron-block-conditions/:id', ({ patronBlockConditions }, request) => {
    return patronBlockConditions.find(request.params.id).attrs;
  });

  this.post('/patron-block-conditions', (schema, { requestBody }) => {
    const conditions = JSON.parse(requestBody);

    return server.createList('patronBlockCondition', 6, conditions);
  });

  this.get('/patron-block-conditions', ({ patronBlockConditions }) => {
    return this.serializerOrRegistry.serialize(patronBlockConditions.all());
  });

  this.get('/patron-block-limits/:id', ({ patronBlockLimits }, request) => {
    return patronBlockLimits.find(request.params.id).attrs;
  });

  this.put('/patron-block-limits/:id', ({ patronBlockLimits }, request) => {
    return patronBlockLimits.find(request.params.id).attrs;
  });

  this.delete('/patron-block-limits/:id', ({ patronBlockLimits }, request) => {
    return patronBlockLimits.find(request.params.id).destroy();
  });

  this.post('/patron-block-limits', function (schema, { requestBody }) {
    const limit = JSON.parse(requestBody);

    return server.create('patron-block-limit', limit);
  });

  this.get('/patron-block-limits', ({ patronBlockLimits }) => {
    return this.serializerOrRegistry.serialize(patronBlockLimits.all());
  });

  this.get('/custom-fields', {
    'customFields': [{
      'id': '1',
      'name': 'Textbox 1',
      'refId': 'textbox-1',
      'type': 'TEXTBOX_SHORT',
      'entityType': 'user',
      'visible': true,
      'required': true,
      'order': 1,
      'helpText': 'helpful text',
    }, {
      'id': '2',
      'name': 'Textbox 2',
      'refId': 'textbox-2',
      'type': 'TEXTBOX_SHORT',
      'entityType': 'user',
      'visible': true,
      'required': false,
      'order': 2,
      'helpText': '',
    }, {
      'id': '3',
      'name': 'Textarea 3',
      'refId': 'textarea-3',
      'type': 'TEXTBOX_LONG',
      'entityType': 'user',
      'visible': false,
      'required': false,
      'order': 3,
      'helpText': '',
    }, {
      'id': '4',
      'name': 'Textarea 4',
      'refId': 'textarea-4',
      'type': 'TEXTBOX_LONG',
      'entityType': 'user',
      'visible': true,
      'required': false,
      'order': 4,
      'helpText': 'help text',
    }]
  });

  this.post('/authn/credentials', {});

  this.get('/authn/credentials', (schema, request) => {
    const url = new URL(request.url);
    const cqlQuery = url.searchParams.get('query');

    if (cqlQuery != null) {
      const cqlParser = new CQLParser();
      cqlParser.parse(cqlQuery);

      if (cqlParser.tree.term) {
        return schema.credentials.where({
          userId: cqlParser.tree.term
        });
      }
    }

    return schema.credentials.all();
  });

  this.get('/automated-patron-blocks/:id', {
    automatedPatronBlocks: [],
    totalRecords: 0,
  });

  this.get('/departments', {
    departments: [{
      id: 'test-1',
      name: 'Test1',
      code: 'test1',
      usageNumber: 0,
      metadata: {
        createdDate: () => '2019-02-05T18:49:20.839+0000',
        createdByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd',
        updatedDate: () => '2019-02-05T18:49:20.839+0000',
        updatedByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd'
      },
    },
    {
      id: 'test-2',
      name: 'Test2',
      code: 'test2',
      usageNumber: 1,
      metadata: {
        createdDate: () => '2019-02-05T18:49:20.839+0000',
        createdByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd',
        updatedDate: () => '2019-02-05T18:49:20.839+0000',
        updatedByUserId: () => 'ce0e0d5b-b5f3-4ad5-bccb-49c0784298fd'
      },
    }]
  });

  this.post('/accounts/:id/check-pay', ({ accounts }, request) => {
    const account = accounts.find(request.params.id).attrs;

    return {
      accountId: account.id,
      amount: '500.00',
      allowed: true,
      remainingAmount: '0.00'
    };
  });

  this.post('/accounts/:id/check-waive', ({ accounts }, request) => {
    const account = accounts.find(request.params.id).attrs;

    return {
      accountId: account.id,
      amount: '500.00',
      allowed: true,
      remainingAmount: '0.00'
    };
  });

  this.post('/accounts/:id/check-transfer', ({ accounts }, request) => {
    const account = accounts.find(request.params.id).attrs;

    return {
      accountId: account.id,
      amount: '500.00',
      allowed: true,
      remainingAmount: '0.00'
    };
  });

  this.post('/accounts/:id/check-refund', ({ accounts }, request) => {
    const account = accounts.find(request.params.id).attrs;

    return {
      accountId: account.id,
      amount: '100.00',
      allowed: true,
      remainingAmount: '0.00'
    };
  });

  this.post('/accounts/:id/pay', ({ accounts }, request) => {
    const account = accounts.find(request.params.id).attrs;

    return {
      accountId: account.id,
      amount: account.amount
    };
  });

  this.post('/accounts/:id/waive', ({ accounts }, request) => {
    const account = accounts.find(request.params.id).attrs;

    return {
      accountId: account.id,
      amount: account.amount
    };
  });

  this.post('/accounts/:id/transfer', ({ accounts }, request) => {
    const account = accounts.find(request.params.id).attrs;

    return {
      accountId: account.id,
      amount: account.amount
    };
  });

  this.post('/accounts/:id/refund', ({ accounts }, request) => {
    const account = accounts.find(request.params.id).attrs;

    return {
      accountId: account.id,
      amount: account.amount
    };
  });

  this.post('/accounts/:id/cancel', ({ accounts }, request) => {
    const account = accounts.find(request.params.id).attrs;

    return { accountId: account.id };
  });

  this.post('/accounts-bulk/check-transfer', () => {
    return {
      amounts: [
        {
          accountId: 'id1',
          amount: 100
        },
        {
          accountId: 'id2',
          amount: 100
        }
      ],
      allowed: true,
      amount: 100,
      remainingAmount: 100
    };
  });

  this.post('/accounts-bulk/transfer', () => {
    return {
      accountIds: ['id1', 'id2', 'id3', 'id4'],
      feefineactions: [
        {
          typeAction: 'Transferred partially',
          amountAction: 10.0,
          balance: 980.0,
          paymentMethod: 'account',
          accountId: 'id1',
          userId: 'id4',
          id: 'id5'
        },
        {
          typeAction: 'Transferred partially',
          amountAction: 10.0,
          balance: 980.0,
          paymentMethod: 'account',
          accountId: 'id2',
          userId: 'id4',
          id: 'id6'
        },
        {
          typeAction: 'Transferred partially',
          amountAction: 10.0,
          balance: 980.0,
          paymentMethod: 'account',
          accountId: 'id3',
          userId: 'id4',
          id: 'id7'
        },
        {
          typeAction: 'Transferred partially',
          amountAction: 10.0,
          balance: 980.0,
          paymentMethod: 'account',
          accountId: 'id4',
          userId: 'id4',
          id: 'id8'
        },
      ],
      amount : 40.00
    };
  });

  this.post('/accounts-bulk/check-refund', () => {
    return {
      amounts: [
        {
          accountId: 'r1',
          amount: 100
        },
        {
          accountId: 'r2',
          amount: 200
        },
        {
          accountId: 'r3',
          amount: 100
        }
      ],
      allowed: true,
      amount: 400,
      remainingAmount: 100
    };
  });

  this.post('/accounts-bulk/refund', () => {
    return {
      accountIds: ['r1', 'r2', 'r3'],
      feefineactions: [
        {
          typeAction: 'Refunded fully',
          amountAction: 100.0,
          balance: 500.0,
          accountId: 'r1',
          userId: 'user1',
          id: 'w1'
        },
        {
          typeAction: 'Refunded fully',
          amountAction: 200.0,
          balance: 400.0,
          accountId: 'r2',
          userId: 'user1',
          id: 'w2'
        },
        {
          typeAction: 'Refunded fully',
          amountAction: 100.0,
          balance: 500.0,
          accountId: 'r3',
          userId: 'user1',
          id: 'w3'
        },
      ],
      amount : 400.00
    };
  });
}
