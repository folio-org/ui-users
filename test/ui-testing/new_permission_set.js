/* eslint-disable no-console */
/* global it describe before after */
module.exports.test = function foo(uiTestCtx, nightmareX) {
  describe('Module test: users:new_permission_set', function bar() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);
    this.timeout(Number(config.test_timeout));

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

      it('should open app and find version tag', (done) => {
        nightmare
          .use(openApp(nightmare, config, done, 'users', testVersion))
          .then(result => result)
          .catch(done);
      });
      it('should create a new permission set', (done) => {
        nightmare
          .click(config.select.settings)
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
          .wait('button[class^="itemControl"]')
          .xclick('//button[contains(.,"Users: Can create new user")]')
          .then(() => {
            nightmare
              .wait('#clickable-add-permission')
              .click('#clickable-add-permission')
              .wait('button[class^="itemControl"]')
              .xclick('//button[contains(.,"Users: Can view proxies")]')
              .wait('#clickable-save-permission-set')
              .click('#clickable-save-permission-set')
              .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
              .then(done)
              .catch(done);
          })
          .catch(done);
      });
      it('should confirm creation of new permission set', (done) => {
        nightmare
          .click(config.select.settings)
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
