/* eslint-disable no-console */
/* global it describe before after Nightmare */
module.exports.test = function foo(uiTestCtx) {
  describe('Module test: users:new-permission-set', function bar() {
    const { config, helpers: { login, logout, clickSettings } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);
    this.timeout(Number(config.test_timeout));

    const waitText = (label) => {
      return Array.from(
        document.querySelectorAll('ul[class*="PermissionList"] li')
      )
        .findIndex(e => e.textContent === label) >= 0;
    };

    describe('Login > Create new permission set > Confirm creation > Delete permission set > Confirm deletion > Logout\n', () => {
      const displayName = 'Circulation employee';
      const description = 'Contains permissions to execute basic circ functions.';
      let uuid = null;

      before((done) => {
        login(nightmare, config, done); // logs in with the default admin credentials
      });

      after((done) => {
        logout(nightmare, config, done);
      });

      it('should navigate to settings', (done) => {
        clickSettings(nightmare, done);
      });

      it('should create a new permission set', (done) => {
        nightmare
          .wait('a[href="/settings/users"]')
          .click('a[href="/settings/users"]')
          .wait('a[href="/settings/users/perms"]')
          .click('a[href="/settings/users/perms"]')
          .wait('#clickable-create-entry')
          .click('#clickable-create-entry')
          .wait('#input-permission-title')
          .insert('#input-permission-title', displayName)
          .insert('#input-permission-description', description)
          .wait('#clickable-add-permission')
          .click('#clickable-add-permission')
          .wait('ul[class*="PermissionList"] li button[data-permission-name="ui-users.create"]')
          .click('ul[class*="PermissionList"] li button[data-permission-name="ui-users.create"]')
          .wait('#permSection ul li[data-permission-name="ui-users.create"]')
          .click('#clickable-add-permission')
          .wait('ul[class*="PermissionList"] li button[data-permission-name="ui-users.viewproxies"]')
          .click('ul[class*="PermissionList"] li button[data-permission-name="ui-users.viewproxies"]')
          .wait('#permSection ul li[data-permission-name="ui-users.viewproxies"]')
          .wait(() => Array.from(document.querySelectorAll('#permSection ul li').length === 2))
          .wait('#clickable-save-permission-set')
          .wait(() => !document.querySelector('#clickable-save-permission-set[disabled]'))
          .click('#clickable-save-permission-set')
          .wait(() => !document.querySelector('#clickable-save-permission-set'))
          .then(done)
          .catch(done);
      });

      it('should navigate to settings', (done) => {
        clickSettings(nightmare, done);
      });

      it('should confirm creation of new permission set', (done) => {
        nightmare
          .wait('a[href="/settings/users"]')
          .click('a[href="/settings/users"]')
          .wait('a[href="/settings/users/perms"]')
          .click('a[href="/settings/users/perms"]')
          .wait('div.hasEntries')
          .evaluate((name) => {
            const node = Array.from(
              document.querySelectorAll('div.hasEntries nav a div')
            ).find(e => e.textContent === name);
            if (node) {
              node.parentElement.click();
            } else {
              throw new Error(`Could not find the permission set ${name}`);
            }
          }, displayName)
          .then(() => {
            nightmare
              .wait('#clickable-edit-item')
              .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
              .then(done)
              .catch(done);
          })
          .catch(done);
      });

      it('should delete new permission set', (done) => {
        nightmare
          .click('#clickable-edit-item')
          .wait('#clickable-delete-set')
          .click('#clickable-delete-set')
          .wait('#clickable-deletepermissionset-confirmation-confirm')
          .click('#clickable-deletepermissionset-confirmation-confirm')
          .waitUntilNetworkIdle(500)
          .url()
          .then((result) => {
            done();
            uuid = result;
            uuid = uuid.replace(/^.+\/([^?]+).*/, '$1');
            console.log(`          ID of deleted permission set: ${uuid}`);
          })
          .catch(done);
      });

      it('should confirm deletion', (done) => {
        nightmare
          .wait('a[href^="/settings/users/groups"]')
          .click('a[href^="/settings/users/groups"]')
          .wait('a[href="/settings/users/perms"]')
          .click('a[href="/settings/users/perms"]')
          .wait((euuid) => {
            const element = document.querySelector(`a[href*="${euuid}"]`);
            if (element) {
              return false;
            }

            return true;
          }, uuid)
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then(() => { done(); })
          .catch(done);
      });
    });
  });
};
