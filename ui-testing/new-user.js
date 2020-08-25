/* eslint-disable no-console */
/* global it describe before after Nightmare */
module.exports.test = function meh(uitestctx) {
  describe('Module test: users:new-user', function bar() {
    const { config, helpers: { namegen, login, logout, clickApp } } = uitestctx;
    const nightmare = new Nightmare(config.nightmare);
    this.timeout(Number(config.test_timeout));
    let pgroup = null;
    const user = namegen();
    // user.id = 'hellox';
    user.password = user.id;

    before((done) => {
      login(nightmare, config, done); // logs in with the default admin credentials
    });

    after((done) => {
      logout(nightmare, config, done);
    });

    describe('Login > Create new user > Edit new user and confirm changes', () => {
      it('should navigate to users', (done) => {
        clickApp(nightmare, done, 'users');
      });

      it('should extract a patron group value', (done) => {
        nightmare
          .wait('#input-user-search')
          .wait('#clickable-newuser')
          .click('#clickable-newuser')
          .wait('#adduser_group > option:nth-of-type(4)')
          .evaluate(() => document.querySelector('#adduser_group > option:nth-of-type(3)').value)
          .then((result) => {
            done();
            pgroup = result;
          })
          .catch(done);
      });

      it(`should create a user: ${user.id}/${user.password}`, (done) => {
        nightmare
          // user information accordion
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
          .wait('#adduser_expirationdate')
          .insert('#adduser_expirationdate', '01/01/2022')

          // extended information accordion
          .wait('#adduser_enrollmentdate')
          .insert('#adduser_enrollmentdate', '01/01/2017')
          .wait('#adduser_dateofbirth')
          .insert('#adduser_dateofbirth', '05/04/1980')
          .wait('#adduser_username')
          .insert('#adduser_username', user.id)

          // contact information accordion
          .wait('#adduser_email')
          .insert('#adduser_email', user.email)
          .wait('#adduser_preferredcontact')
          .type('#adduser_preferredcontact', 'e')

          // save!
          .wait('#clickable-save')
          .click('#clickable-save')
          .wait('#userInformationSection')
          .wait((uid) => {
            const us = document.querySelector('#extendedInfoSection');
            let bool = false;
            if (us.textContent.match(uid)) {
              bool = true;
            }
            return bool;
          }, user.id)
          .then(done)
          .catch(done);
      });

      it(`should change username for ${user.id}`, (done) => {
        nightmare
          .wait('#input-user-search')
          .insert('#input-user-search', user.id)
          .wait('button[type=submit]')
          .click('button[type=submit]')
          .wait('#list-users[data-total-count="1"]')
          .evaluate((uid) => {
            const node = Array.from(
              document.querySelectorAll('#list-users [role="row"] [role="gridcell"]')
            ).find(e => e.textContent === uid);
            if (node) {
              node.parentElement.click();
            } else {
              throw new Error(`Could not find the user ${uid} to edit`);
            }
          }, user.id)
          .then(() => {
            nightmare
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
              .click('#clickable-save')
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
          })
          .catch(done);
      });
    });
  });
};
