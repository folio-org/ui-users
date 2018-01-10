/* global it describe Nightmare */
/* eslint func-names: ["error", "never"] */
module.exports.test = function (uitestctx) {
  describe('Module test: users:new_user', function () {
    const { config, helpers: { namegen, openApp }, meta: { testVersion } } = uitestctx;

    this.timeout(Number(config.test_timeout));
    const nightmare = new Nightmare(config.nightmare);

    let pgroup = null;
    const user = namegen();

    describe('Login > Create new user > Logout > Login as new user > Logout > Login > Edit new user and confirm changes', () => {
      const flogin = function (un, pw) {
        it(`should login as ${un}/${pw}`, (done) => {
          nightmare
          .wait(config.select.username)
          .insert(config.select.username, un)
          .insert(config.select.password, pw)
          .click('#clickable-login')
          .wait(555)
          .wait(() => {
            let rvalue = false;
            const success = document.querySelector('#clickable-logout');
            const fail = document.querySelector('span[class^="loginError"]');
            if (fail) {
              throw new Error(fail.textContent);
            } else if (success) {
              rvalue = true;
            }
            return rvalue;
          })
          .wait(555)
          .then((result) => { done(); })
          .catch(done);
        });
      };
      const flogout = function () {
        it('should logout', (done) => {
          nightmare
          .click('#clickable-logout')
          .wait('#clickable-login')
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then((result) => { done(); })
          .catch(done);
        });
      };

      it('should load login page', (done) => {
        nightmare
        .on('page', (type = 'alert', message) => {
          throw new Error(message);
        })
        .goto(config.url)
        .wait(Number(config.login_wait))
        .then((result) => { done(); })
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
        .wait('#clickable-newuser')
        .wait(555)
        .click('#clickable-newuser')
        .wait('#adduser_group > option:nth-of-type(3)')
        .evaluate(() => document.querySelector('#adduser_group > option:nth-of-type(3)').value)
        .then((result) => {
          pgroup = result;
          done();
        })
        .catch(done);
      });
      it(`should create a user: ${user.id}/${user.password}`, (done) => {
        nightmare
        .insert('#adduser_username', user.id)
        .insert('#pw', user.password)
        .select('#useractive', 'true')
        .insert('#adduser_firstname', user.firstname)
        .insert('#adduser_lastname', user.lastname)
        .insert('#adduser_email', user.email)
        .insert('#adduser_dateofbirth', '1980-05-04')
        .select('#adduser_group', pgroup)
        .insert('#adduser_enrollmentdate', '2017-01-01')
        .insert('#adduser_expirationdate', '2020-01-01')
        .insert('#adduser_barcode', user.barcode)
        .xclick('id("form-user")//button[contains(.,"New")]')
        .wait(555)
        .click('input[id^="PrimaryAddress"]')
        .insert('input[name=country]', user.address.country)
        .insert('input[name*="addressLine1"]', user.address.address)
        .insert('input[name*="city"]', user.address.city)
        .insert('input[name*="stateRegion"]', user.address.state)
        .insert('input[name*="zipCode"]', user.address.zip)
        .select('select[name*="addressType"]', 'Home')
        .click('#clickable-createnewuser')
        .wait('#clickable-newuser')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_slee, 10) : 3000) // debugging
        .then((result) => { done(); })
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
        .wait(`div[title="${user.id}"]`)
        .click(`div[title="${user.id}"]`)
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
        .wait(parseInt(process.env.FOLIO_UI_DEBU, 10) ? parseInt(config.debug_slee, 10) : 555) // debugging
        .then((result) => { done(); })
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
        .end()
        .then((result) => { done(); })
        .catch(done);
      });
    });
  });
};
