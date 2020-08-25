/* eslint-disable no-console */
/* global it describe before after Nightmare */
module.exports.test = function foo(uiTestCtx) {
  describe('Module test: users:new-permission-set', function bar() {
    const { config, helpers: { login, logout, clickSettings } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);
    this.timeout(Number(config.test_timeout));

    describe('Login > Create new permission set > Confirm creation > Delete permission set > Confirm deletion > Logout\n', () => {
      const displayName = `Circulation employee-${Math.floor(Math.random() * 10000)}`;
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
          .wait('#list-permissions[aria-rowcount]')
          .wait('#list-permissions[aria-rowcount] [data-permission-name="ui-users.create"]')
          .click('#list-permissions[aria-rowcount] [data-permission-name="ui-users.create"]')
          .wait('#list-permissions[aria-rowcount] [data-permission-name="ui-users.viewproxies"]')
          .click('#list-permissions[aria-rowcount] [data-permission-name="ui-users.viewproxies"]')
          .wait('#clickable-permissions-modal-save')
          .click('#clickable-permissions-modal-save')
          .wait('#permSection [data-permission-name="ui-users.create"]')
          .wait('#permSection [data-permission-name="ui-users.viewproxies"]')
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
          .wait((dn) => {
            const index = Array.from(
              document.querySelectorAll('#ModuleContainer div.hasEntries a[class^=NavListItem]')
            ).findIndex(e => e.textContent === dn);
            return index >= 0;
          }, displayName)
          .evaluate((dn) => {
            const index = Array.from(
              document.querySelectorAll('#ModuleContainer div.hasEntries a[class^=NavListItem]')
            ).findIndex(e => e.textContent === dn);
            if (index === -1) {
              throw new Error(`Could not find the permission-set ${dn}`);
            }
            // CSS selectors are 1-based, which is just totally awesome.
            return index + 1;
          }, displayName)
          .then((entryIndex) => {
            nightmare
              .wait(`#ModuleContainer div.hasEntries div:nth-of-type(${entryIndex}) a[class^=NavListItem]`)
              .click(`#ModuleContainer div.hasEntries div:nth-of-type(${entryIndex}) a[class^=NavListItem]`)
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
