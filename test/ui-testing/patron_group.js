/* eslint-disable no-console */
/* global it describe */
module.exports.test = function foo(uiTestCtx, nightmare) {
  describe('Module test: users:patron_group', function meh() {
    const { config, helpers: { openApp }, meta: { testVersion } } = uiTestCtx;
    this.timeout(Number(config.test_timeout));
    let userid = null;
    let communityid = null;
    let staffid = null;
    const wait = 1111;

    describe('Login > Add new patron group > Assign to user > Try to delete patron group > Unassign from user > Try to delete again > Logout\n', () => {
      const gid = `alumni_${Math.floor(Math.random() * 10000)}`;
      const gidlabel = 'Alumni';
      // const deletePath = `div[title="${gid}"] ~ div:last-of-type button[id*="delete"]`;

      const flogin = function minc(un, pw) {
        it(`should login as ${un}/${pw}`, (done) => {
          nightmare
          /* .on('page', (type = 'alert', message) => {
            throw new Error(message);
          }) */
            .goto(config.url)
            .wait(Number(config.login_wait))
            .insert(config.select.username, un)
            .insert(config.select.password, pw)
            .click('#clickable-login')
            .wait('#clickable-logout')
            .then(() => { done(); })
            .catch(done);
        });
      };
      const flogout = function buh() {
        it('should logout', (done) => {
          nightmare
            .click('#clickable-logout')
            .wait(config.select.username)
            .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 0) // debugging
            .then(() => { done(); })
            .catch(done);
        });
      };
      flogin(config.username, config.password);
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
          .wait('#list-users div[role="listitem"]:nth-of-type(2) > a > div:nth-of-type(5)')
          .evaluate(() => document.querySelector('#list-users div[role="listitem"]:nth-of-type(2) > a > div:nth-of-type(5)').textContent)
          .then((result) => {
            userid = result;
            done();
            console.log(`        (found user ID ${userid})`);
          })
          .catch(done);
      });
      it(`should find patron group ID for "${gid}"`, (done) => {
        nightmare
          .wait('#input-user-search')
          .type('#input-user-search', '0')
          .wait('#clickable-reset-all')
          .click('#clickable-reset-all')
          .type('#input-user-search', userid)
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
          }, userid)
          .then(() => {
            nightmare
              .wait('#clickable-edituser')
              .click('#clickable-edituser')
              .wait('#adduser_group')
              .xtract(`id("adduser_group")/option[contains(.,"${gid}" )]/@value`)
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
      it('should find ID for "Staff" group', (done) => {
        nightmare
          .click('#clickable-users-module')
          .wait(`input[id*="${gid}"]`)
          .click(`input[id*="${gid}"]`)
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
          }, userid)
          .then(() => {
            nightmare
              .wait('#clickable-edituser')
              .click('#clickable-edituser')
              .wait('#adduser_group')
              .xtract('id("adduser_group")/option[contains(.,"Staff")]/@value')
              .then((result) => {
                staffid = result;
                done();
                console.log(`        (found "Staff" group ID ${staffid})`);
              })
              .catch(done);
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
          .evaluate((groupId) => {
            Array.from(
              document.querySelectorAll('#editList-patrongroups div[role="gridcell"]')
            )
              .find(e => e.textContent === `${groupId}`)
              .parentElement.querySelector('button[icon="trashBin"]').click();
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
          .evaluate((egid) => {
            const cnode = document.evaluate(`//div[.="${egid}"]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            if (cnode.singleNodeValue) {
              throw new Error(`${egid} patron group found after clicking "Delete" button!`);
            }
          }, gid)
          .then(done)
          .catch(done);
      });
      flogout();
    });
  });
};
