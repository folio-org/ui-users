/* eslint-disable no-console */
/* global it describe Nightmare */
module.exports.test = function meh(uitestctx, nightmare) {
  describe('Module test: users:new_user', function bar() {
    const { config, helpers: { namegen, openApp }, meta: { testVersion } } = uitestctx;
    this.timeout(Number(config.test_timeout));
    let pgroup = null;
    const user = namegen();
    // user.id = 'hellox';
    user.password = user.id;

    describe('Login > Create new user > Logout > Login as new user > Logout > Login > Edit new user and confirm changes', () => {
      const flogin = function buh(un, pw) {
        it(`should login as ${un}/${pw}`, (done) => {
          nightmare
            .wait(config.select.username)
            .insert(config.select.username, un)
            .insert(config.select.password, pw)
            .click('#clickable-login')
            .wait('#clickable-logout')
            /* .wait(() => {
              let rvalue = false;
              const success = document.querySelector('#clickable-logout');
              const fail = document.querySelector('div[class^="formMessage"]');
              if (fail) {
                rvalue = false;
              } else if (success) {
                rvalue = true;
              }
              return rvalue;
            })
            .wait(555) */
            .then(() => { done(); })
            .catch(done);
        });
      };
      const flogout = function sma() {
        it('should logout', (done) => {
          nightmare
            .click('#clickable-logout')
            .wait('#clickable-login')
            .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
            .then(() => { done(); })
            .catch(done);
        });
      };

      it('should load login page', (done) => {
        nightmare
          .on('page', (type, message) => {
            throw new Error(message);
          })
          .goto(config.url)
          .wait(Number(config.login_wait))
          .then(() => { done(); })
          .catch(done);
      });

      flogin(config.username, config.password);

      it('should open app and find version tag', (done) => {
        nightmare
          .use(openApp(nightmare, config, done, 'users', testVersion))
          .then(result => result);
      });
      it('should extract a patron group value', (done) => {
        nightmare
          .wait('#clickable-users-module')
          .click('#clickable-users-module')
          .wait('#input-user-search')
          .type('#input-user-search', '0')
          .wait('button[type=submit]')
          .click('button[type=submit]')
          .wait('#list-users div[role="listitem"] > a')
          .click('#clickable-newuser')
          .wait('#adduser_group > option:nth-of-type(4)')
          .evaluate(() => document.querySelector('#adduser_group > option:nth-of-type(3)').value)
          .then((result) => {
            pgroup = result;
            done();
          })
          .catch(done);
      });
      it(`should create a user: ${user.id}/${user.password}`, (done) => {
        nightmare
          .wait('#adduser_lastname')
          .insert('#adduser_lastname', user.lastname)
          .wait('#adduser_firstname')
          .insert('#adduser_firstname', user.firstname)
          .wait('#adduser_barcode')
          .insert('#adduser_barcode', user.barcode)
          .wait('#adduser_group')
          .select('#adduser_group', pgroup)
          .wait('#useractive')
          .select('#useractive', 'true')
          .wait('#adduser_username')
          .insert('#adduser_username', user.id)
          .wait('#clickable-toggle-password')
          .click('#clickable-toggle-password')
          // It would be super-cool if the async username-blur validation
          // fired reliably in electron, but for some reason it doesn't,
          // which means waiting for the validation-success sometimes means
          // we wait forever. It _does_ fire reliably with a real browser.
          // .wait('#icon-adduser_username-validation-success')
          .wait(222)
          .wait('#pw')
          .insert('#pw', user.password)
          .wait('#adduser_email')
          .insert('#adduser_email', user.email)
          .wait('#adduser_dateofbirth')
          .insert('#adduser_dateofbirth', '05/04/1980')
          .wait('#adduser_enrollmentdate')
          .insert('#adduser_enrollmentdate', '01/01/2017')
          .wait('#adduser_expirationdate')
          .insert('#adduser_expirationdate', '01/01/2022')
          .xclick('id("form-user")//button[contains(.,"New")]')
          .wait('input[id^="PrimaryAddress"]')
          .click('input[id^="PrimaryAddress"]')
          // .click('button[name="personal.addresses[0].country"]')
          // .wait(`li[id*="${user.address.country}"]`)
          // .click(`li[id*="${user.address.country}"]`)
          .insert('input[name*="addressLine1"]', user.address.address)
          .insert('input[name*="city"]', user.address.city)
          .insert('input[name*="stateRegion"]', user.address.state)
          .insert('input[name*="zipCode"]', user.address.zip)
          .select('select[name*="addressType"]', 'Home')
          // .wait(222)
          .wait('#clickable-createnewuser')
          .click('#clickable-createnewuser')
          .wait('#userInformationSection')
          /* .wait((uid) => {
            const us = document.querySelector('#userInformationSection');
            let bool = false;
            if (us.textContent.match(uid)) {
              bool = true;
            }
            return bool;
          }, user.id) */
          .then(done)
          .catch(done);
      });
      flogout();
      flogin(user.id, user.password);
      flogout();
      flogin(config.username, config.password);
      it(`should change username for ${user.id}`, (done) => {
        nightmare
          .wait('#clickable-users-module')
          .click('#clickable-users-module')
          .wait('#input-user-search')
          .insert('#input-user-search', user.id)
          .wait('button[type=submit]')
          .click('button[type=submit]')
          .wait('#list-users[data-total-count="1"]')
          .evaluate((uid) => {
            const node = Array.from(
              document.querySelectorAll('#list-users div[role="listitem"] > a > div[role="gridcell"]')
            ).find(e => e.textContent === uid);
            if (node) {
              node.parentElement.click();
            } else {
              throw new Error(`Could not find the user ${uid} to edit`);
            }
          }, user.id)
          .wait('#clickable-edituser')
          .click('#clickable-edituser')
          .wait('#adduser_username')
          .wait(555)
          .click('#adduser_username')
          .type('#adduser_username', null)
          .wait(555)
          .insert('#adduser_username', `${user.id}x`)
          .select('#adduser_group', pgroup)
          .wait(555)
          .click('#clickable-updateuser')
          .wait(555)
          .wait((uid) => {
            let rvalue = false;
            const xp = document.evaluate(`//div[.="${uid}"]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            if (xp.singleNodeValue !== null) {
              rvalue = true;
            }
            return rvalue;
          }, `${user.id}x`)
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then(() => { done(); })
          .catch(done);
      });
      flogout();
      it(`Should login as ${user.id}x/${user.password}`, (done) => {
        nightmare
          .wait('#input-username')
          .wait(222)
          .insert('#input-username', `${user.id}x`)
          .insert('#input-password', user.password)
          .click('#clickable-login')
          .wait('#clickable-logout')
          .click('#clickable-logout')
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then(() => { done(); })
          .catch(done);
      });
    });
  });
};
