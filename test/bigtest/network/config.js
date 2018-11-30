import CQLParser from './cql';

// typical mirage config export
// http://www.ember-cli-mirage.com/docs/v0.4.x/configuration/
export default function config() {
  // okapi endpoints
  this.get('/_/version', () => '0.0.0');

  this.get('_/proxy/tenants/:id/modules', []);

  this.get('/saml/check', {
    ssoEnabled: false
  });

  this.get('/configurations/entries', {
    configs: []
  });

  this.get('/users', {});
  this.get('/addresstypes', {});

  this.post('/bl-users/login', () => {
    return new Response(201, {
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
      });
  });

  this.get('/users', ({ users }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      return users.where({
        id: cqlParser.tree.term
      });
    } else {
      return [];
    }
  });
}
