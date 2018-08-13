/* eslint-disable no-console */
/* global it describe Nightmare before after */
module.exports.test = function foo(uiTestCtx) {
  describe('Module test: users:new_service_point', function meh() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);
    this.timeout(Number(config.test_timeout));
    const wait = 1111;

    describe('Login > Add new service point > Assign sp to user > Unassign sp from user > delete service point > Logout\n', () => {
      let userIds = [];
      let spId = '';
      let prevSpId = '';
      const spName = `service_point_${Math.floor(Math.random() * 10000)}`;

      before(done => login(nightmare, config, done));
      after(done => logout(nightmare, config, done));

      it('should open app and find version tag', (done) => {
        nightmare
          .use(openApp(nightmare, config, done, 'users', testVersion))
          .then(result => result);
      });

      it(`should create a new service point for "${spName}"`, (done) => {
        nightmare
          .click(config.select.settings)
          .wait('a[href="/settings/organization"]')
          .wait(wait)
          .click('a[href="/settings/organization"]')
          .wait('a[href="/settings/organization/servicePoints"]')
          .wait(wait)
          .click('a[href="/settings/organization/servicePoints"]')
          .wait(wait)
          .click('#servicepoints-add-new')
          .wait(wait)
          .type('input[name="name"]', spName)
          .type('input[name="code"]', spName)
          .type('input[name="discoveryDisplayName"]', spName)
          .wait(wait)
          .click('#clickable-save-service-point')
          .wait(wait)
          .evaluate((name) => {
            const items = document.querySelectorAll('a > div');
            const result = {};
            items.forEach((node, index) => {
              if (node.innerText === name) {
                result.spId = node.parentElement.href.split('/').pop();
                result.prevSpId = items[index - 1].parentElement.href.split('/').pop();
                node.click();
              }
            });
            return result;
          }, spName)
          .then((result) => {
            spId = result.spId;
            prevSpId = result.prevSpId;
            done();
          })
          .catch(done);
      });

      it('should get active user barcodes', (done) => {
        nightmare
          .wait('#clickable-users-module')
          .click('#clickable-users-module')
          .wait(wait)
          .wait('#input-user-search')
          .wait(wait)
          .type('#input-user-search', '0')
          .wait(wait)
          .wait('#list-users div[role="listitem"]:nth-child(9)')
          .evaluate(() => {
            const ubc = [];
            const list = document.querySelectorAll('#list-users div[role="listitem"]');
            list.forEach((node) => {
              const status = node.querySelector('a div:nth-child(1)').innerText;
              const barcode = node.querySelector('a div:nth-child(3)').innerText;
              const uuid = node.querySelector('a').href.replace(/.+?([^/]+)\?.*/, '$1');
              if (barcode && status.match(/Active/)) {
                ubc.push({
                  barcode,
                  uuid,
                });
              }
            });
            return ubc;
          })
          .then((result) => {
            userIds = result;
            done();
          })
          .catch(done);
      });

      it('should add service point to user', (done) => {
        nightmare
          .wait(wait)
          .wait('#input-user-search')
          .type('#input-user-search', '0')
          .wait('#clickable-reset-all')
          .click('#clickable-reset-all')
          .insert('#input-user-search', userIds[0].barcode)
          .wait('#clickable-edituser')
          .click('#clickable-edituser')
          .wait('#accordion-toggle-button-servicePoints')
          .click('#accordion-toggle-button-servicePoints')
          .wait('#add-service-point-btn')
          .click('#add-service-point-btn')
          .wait(`[name="selected-${spId}"]`)
          .click(`[name="selected-${spId}"]`)
          .wait('#save-service-point-btn')
          .click('#save-service-point-btn')
          .wait('#servicePointPreference')
          .select('#servicePointPreference', spId)
          .wait(wait)
          .wait('#clickable-updateuser')
          .click('#clickable-updateuser')
          .wait(wait)
          .then(done)
          .catch(done);
      });

      it('should remove service point from user', (done) => {
        nightmare
          .wait(wait)
          .wait('#input-user-search')
          .type('#input-user-search', '0')
          .wait('#clickable-reset-all')
          .click('#clickable-reset-all')
          .insert('#input-user-search', userIds[0].barcode)
          .wait('#clickable-edituser')
          .click('#clickable-edituser')
          .wait('#accordion-toggle-button-servicePoints')
          .click('#accordion-toggle-button-servicePoints')
          .wait(`#clickable-remove-service-point-${spId}`)
          .click(`#clickable-remove-service-point-${spId}`)
          .wait('#servicePointPreference')
          .select('#servicePointPreference', prevSpId)
          .wait(wait)
          .wait('#clickable-updateuser')
          .click('#clickable-updateuser')
          .wait(wait)
          .then(done)
          .catch(done);
      });

      it(`should delete "${spName}" service point`, (done) => {
        nightmare
          .click(config.select.settings)
          .wait('a[href="/settings/organization"]')
          .wait(wait)
          .click('a[href="/settings/organization"]')
          .wait('a[href="/settings/organization/servicePoints"]')
          .wait(wait)
          .click('a[href="/settings/organization/servicePoints"]')
          .wait(wait)
          .evaluate((name) => {
            const items = document.querySelectorAll('a > div');
            items.forEach((servicePointEl) => {
              if (servicePointEl.innerText === name) {
                servicePointEl.click();
              }
            });
          }, spName)
          .wait(wait)
          .wait('#clickable-edit-item')
          .wait(wait)
          .click('#clickable-edit-item')
          .wait('#clickable-delete-service-point')
          .wait(wait)
          .click('#clickable-delete-service-point')
          .wait('#clickable-deleteservicepoint-confirmation-confirm')
          .click('#clickable-deleteservicepoint-confirmation-confirm')
          .wait('#clickable-save-service-point')
          .click('#clickable-save-service-point')
          .wait(wait)
          .then(done)
          .catch(done);
      });
    });
  });
};
