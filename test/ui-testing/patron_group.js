/* eslint-disable no-console */
/* global it describe before after Nightmare */
module.exports.test = function foo(uiTestCtx) {
  describe('Module test: users:patron_group', function meh() {
    const { config, helpers: { openApp, login, logout }, meta: { testVersion } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));
    let userBarcode = null;
    let communityid = null;
    let staffid = null;
    const wait = 1111;


    before((done) => {
      login(nightmare, config, done); // logs in with the default admin credentials
    });

    after((done) => {
      logout(nightmare, config, done);
    });

    describe('Login > Add new patron group > Assign to user > Try to delete patron group > Unassign from user > Try to delete again > Logout\n', () => {
      const gid = `alumni_${Math.floor(Math.random() * 10000)}`;
      const gidlabel = 'Alumni';
      // const deletePath = `div[title="${gid}"] ~ div:last-of-type button[id*="delete"]`;

      it('should open app and find version tag', (done) => {
        nightmare
          .use(openApp(nightmare, config, done, 'users', testVersion))
          .then(result => result);
      });

      it(`should create a patron group for "${gidlabel}"`, (done) => {
        nightmare
          .click(config.select.settings)
          .wait('a[href="/settings/users"]')
          .click('a[href="/settings/users"]')
          .wait('a[href="/settings/users/groups"]')
          .click('a[href="/settings/users/groups"]')
          .wait(wait)
          .wait('#editList-patrongroups')
          .wait('#clickable-add-patrongroups')
          .click('#clickable-add-patrongroups')
          .wait(1000)
          .type('input[name="items[0].group"]', gid)
          .type('input[name="items[0].desc"]', gidlabel)
          .wait(1000)
          .wait('#clickable-save-patrongroups-0')
          .click('#clickable-save-patrongroups-0')
          .wait(wait)
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then(() => { done(); })
          .catch(done);
      });

      it('should find an active user to edit', (done) => {
        nightmare
          .wait('#clickable-users-module')
          .click('#clickable-users-module')
          .wait('#clickable-filter-pg-faculty')
          .click('#clickable-filter-pg-faculty')
          .wait('#list-users div[role="listitem"]:nth-of-type(2) > a > div:nth-of-type(3)')
          .evaluate(() => document.querySelector('#list-users div[role="listitem"]:nth-of-type(2) > a > div:nth-of-type(3)').textContent)
          .then((result) => {
            userBarcode = result;
            done();
            console.log(`        (found user ID ${userBarcode})`);
          })
          .catch(done);
      });

      it(`should find patron group ID for "${gid}"`, (done) => {
        nightmare
          .wait('#input-user-search')
          .type('#input-user-search', '0')
          .wait('#clickable-reset-all')
          .click('#clickable-reset-all')
          .type('#input-user-search', userBarcode)
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
          }, userBarcode)
          .then(() => {
            nightmare
              .wait('#clickable-edituser')
              .click('#clickable-edituser')
              .wait('#adduser_group')
              .evaluate((name) => {
                const node = Array.from(
                  document.querySelectorAll('#adduser_group option')
                ).find(e => e.text.startsWith(name));
                if (node) {
                  return node.value;
                } else {
                  throw new Error(`Could not find the ID for the group ${name}`);
                }
              }, gid)
              .then((result) => {
                done();
                communityid = result;
                console.log(`        (found patron group ID ${communityid})`);
              })
              .catch(done);
          })
          .catch(done);
      });

      it(`should edit user record using "${gid}" group`, (done) => {
        nightmare
          .wait(1000)
          .select('#adduser_group', communityid)
          .type('#adduser_externalsystemid', false)
          .type('#adduser_externalsystemid', 'testId')
          .type('#adduser_preferredcontact', 'e')
          .wait('#clickable-updateuser')
          .click('#clickable-updateuser')
          .wait(() => {
            return (!document.getElementById('clickable-updateuser'));
          })
          .then(done)
          .catch(done);
      });

      it('should find patron group ID for "staff"', (done) => {
        nightmare
          .wait('#clickable-edituser')
          .click('#clickable-edituser')
          .wait('#adduser_group')
          .evaluate((name) => {
            const node = Array.from(
              document.querySelectorAll('#adduser_group option')
            ).find(e => e.text.startsWith(name));
            if (node) {
              return node.value;
            } else {
              throw new Error(`Could not find the ID for the group ${name}`);
            }
          }, 'staff')
          .then((result) => {
            done();
            staffid = result;
            console.log(`        (found patron group ID ${communityid})`);
          })
          .catch(done);
      });

      it('should change patron group to "Staff" in user record', (done) => {
        nightmare
          .select('#adduser_group', staffid)
          .type('#adduser_externalsystemid', false)
          .type('#adduser_externalsystemid', 'testId')
          .wait(1000)
          .click('#clickable-updateuser')
          .wait(() => {
            if (!document.getElementById('clickable-updateuser')) {
              return true;
            }
            return false;
          })
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then(() => { done(); })
          .catch(done);
      });

      it(`should delete "${gid}" patron group`, (done) => {
        nightmare
          .wait(1111)
          .click(config.select.settings)
          .wait('a[href="/settings/users"]')
          .click('a[href="/settings/users"]')
          .wait('a[href="/settings/users/groups"]')
          .click('a[href="/settings/users/groups"]')
          .wait('#editList-patrongroups')
          .evaluate((groupId) => {
            Array.from(
              document.querySelectorAll('#editList-patrongroups div[role="gridcell"]')
            )
              .find(e => e.textContent === `${groupId}`)
              .parentElement.querySelector('button[icon="trash"]').click();
          }, gid)
          .then(() => {
            nightmare
              .wait('#clickable-delete-controlled-vocab-entry-confirmation-confirm')
              .click('#clickable-delete-controlled-vocab-entry-confirmation-confirm')
              .then(done)
              .catch(done);
          })
          .catch(done);
      });

      it(`should confirm that "${gid}" patron group has been deleted`, (done) => {
        nightmare
          .wait(wait)
          .wait((egid) => {
            const index = Array.from(
              document.querySelectorAll('#editList-patrongroups div[role="row"] div[role="gridcell"]:first-of-type')
            ).findIndex(e => {
              return e.textContent === egid;
            });
            return !(index >= 0);
          }, gid)
          .then(done)
          .catch(done);
      });
    });
  });
};
