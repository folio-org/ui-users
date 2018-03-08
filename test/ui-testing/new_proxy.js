/* global it describe Nightmare before after */
module.exports.test = function foo(uiTestCtx) {
  describe('Module test: users:new_proxy', function bar() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;

    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('Login > Find user two users > Add proxy to user 1 > Delete sponsor in user 2 > Logout\n', () => {
      let userIds = [];
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

      it('should get active user barcodes', (done) => {
        nightmare
          .click('#clickable-users-module')
          .wait(1000)
          .click('#clickable-filter-active-Active')
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
            done();
            userIds = result;
          })
          .catch(done);
      });

      it('should add a proxy for user 1', (done) => {
        nightmare
          .insert('#input-user-search', userIds[0].barcode)
          .wait('#clickable-edituser')
          .click('#clickable-edituser')
          .wait('#proxy button[title^="expand"]')
          .click('#proxy button[title^="expand"]')
          .wait('#proxy button[title^="Find"]')
          .click('#proxy button[title^="Find"]')
          .wait('div[aria-label="Select User"] #input-user-search')
          .insert('div[aria-label="Select User"] #input-user-search', userIds[1].barcode)
          .wait(222)
          .wait(`div[aria-label="Select User"] #list-users div[role="listitem"] > a > div[title="${userIds[1].barcode}"]`)
          .click(`div[aria-label="Select User"] #list-users div[role="listitem"] > a > div[title="${userIds[1].barcode}"]`)
          .wait('#clickable-updateuser')
          .click('#clickable-updateuser')
          .then(() => { done(); })
          .catch(done);
      });

      it('should delete a sponsor of user 2', (done) => {
        nightmare
          /* .wait(4444)
          .evaluate(() => {
            document.querySelector('#input-user-search').value = '';
          }) */
          .wait('#users-module-display > div > section:nth-child(2) > div > button')
          .click('#users-module-display > div > section:nth-child(2) > div > button')
          .wait(2222)
          .type('#input-user-search', userIds[1].barcode)
          .wait(`#list-users div[role="listitem"] > a > div[title="${userIds[1].barcode}"]`)
          .click(`#list-users div[role="listitem"] > a > div[title="${userIds[1].barcode}"]`)
          .wait(222)
          .click('#clickable-edituser')
          .wait('#proxy button[title^="expand"]')
          .click('#proxy button[title^="expand"]')
          .wait(`#proxy a[href*="${userIds[0].uuid}"]`)
          .xclick(`id("proxy")//a[contains(@href, "${userIds[0].uuid}")]/../../../..//button`)
          .wait('#clickable-deleteproxy-confirmation-confirm')
          .click('#clickable-deleteproxy-confirmation-confirm')
          .wait('#clickable-updateuser')
          .click('#clickable-updateuser')
          .wait(1111)
          .then(() => { done(); })
          .catch(done);
      });
    });
  });
};
