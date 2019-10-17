// eslint-disable-next-line jsx-a11y/label-has-associated-control
import CQLParser from './cql';

// typical mirage config export
// http://www.ember-cli-mirage.com/docs/v0.4.x/configuration/
export default function config() {
  const server = this;

  // okapi endpoints
  this.get('/_/version', () => '0.0.0');

  this.get('_/proxy/tenants/:id/modules', [
    {
      id: 'mod-circulation-16.0.0-SNAPSHOT.253',
      name: 'Circulation Module',
      provides: [
        { id: 'circulation', version: '7.4' },
        { id: 'loan-policy-storage', version: '7.4' }
      ]
    }
  ]);

  this.get('/saml/check', {
    ssoEnabled: false
  });

  this.get('/configurations/entries', {
    configs: []
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
    }

    return users.all();
  });

  this.get('/users/:id', (schema, request) => {
    return schema.users.find(request.params.id).attrs;
  });

  this.put('/users/:id', (schema, request) => {
    return schema.users.find(request.params.id).attrs;
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

      if (field === 'userId') {
        return loans.where((loan) => {
          return loan.userId === term;
        });
      }
    }

    return this.serializerOrRegistry.serialize(loans.all());
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
    return server.create('accounts', acct);
  });

  this.get('waives', {
    waiver: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('payments', {
    payments: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('comments', {
    comments: [],
    totalRecords: 0,
    resultInfo: {
      totalRecords: 0,
      facets: [],
      diagnostics: [],
    },
  });
  this.get('feefines', function ({ feefines }, request) {
    if (request.queryParams.query) {
      const query = /query=(\(.*\)|%28.*%29)/.exec(request.url)[1];
      const cqlParser = new CQLParser();

      cqlParser.parse(query);

      const {
        tree: {
          left,
          right,
        }
      } = cqlParser;

      if (left.field === 'ownerId' || right.field === 'ownerId') {
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

  this.get('/feefineactions', ({ feefineactions }) => {
    return this.serializerOrRegistry.serialize(feefineactions.all());
  });

  this.post('/feefineactions', (schema, { requestBody }) => {
    const ffAction = JSON.parse(requestBody);
    return server.create('feefineactions', ffAction);
  });

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
}
