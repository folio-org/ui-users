module.exports.test = function(uiTestCtx) {

  describe('Module test: users:patron_group', function () {
    const { config, helpers: { openApp }, meta: { testVersion } } = uiTestCtx;

    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout))
    let userid = null;
    let communityid = null;
    let staffid = null;
    let alert = null;
    const wait = 222;

    describe("Login > Add new patron group > Assign to user > Try to delete patron group > Unassign from user > Try to delete again > Logout\n", () => {

      const gid = 'alumni_' + Math.floor(Math.random()*10000)
      const gidlabel = 'Alumni'
      const deletePath = '//div[.="' + gid + '"]//following-sibling::div[last()]//button[contains(.,"Delete")]'

      flogin = function(un, pw) {
        it('should login as ' + un + '/' + pw, done => {
          nightmare
          .on('page', function(type="alert", message) {
             alert = message
          })
          .goto(config.url)
          .wait(Number(config.login_wait))
          .insert(config.select.username, un)
          .insert(config.select.password, pw)
          .click('#clickable-login')
          .wait('#clickable-logout')
          .then(result => { done() })
          .catch(done)
        }) 
      }
      flogout = function() {
        it('should logout', done => {
          nightmare
          .click('#clickable-logout')
          .wait(config.select.username)
          .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 0) // debugging
          .end()
          .then(result => { done() })
          .catch(done)
        })
      }
      flogin(config.username, config.password)
      it('should open app and find version tag', done => {
        nightmare
         .use(openApp(nightmare, config, done, 'users', testVersion ))
         .then(result => result )
      })
      it('should create a patron group for "' + gidlabel + '"', done => {
        nightmare
        .click(config.select.settings)
        .wait('a[href="/settings/users"]')
        .wait(wait)
        .click('a[href="/settings/users"]')
        .wait('a[href="/settings/users/groups"]')
        .wait(wait)
        .click('a[href="/settings/users/groups"]')
        .wait(wait)
        .xclick('//button[contains(.,"Add new")]')
        .wait(wait)
        .type('input[name="items[0].group"]', gid)
        .type('input[name="items[0].desc"]', gidlabel)
        .xclick('//li//button[.="Save"]')
        .wait(wait)
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should find a user to edit', done => {
        nightmare
        .click('#clickable-users-module')
        .wait('#list-users div[role="listitem"]:nth-of-type(11) > a > div:nth-of-type(5)')
        .evaluate(function() {
          return document.querySelector('#list-users div[role="listitem"]:nth-of-type(11) > a > div:nth-of-type(5)').title
        })
        .then(function(result) {
          userid = result
          done()
          console.log('        (found user ID ' + userid + ")")
        })
        .catch(done)
      })
      it('should find patron group ID for "' + gid + '"', done => {
        nightmare
        .type('#input-user-search', userid)
        .wait('div[title="' + userid + '"]')
        .click('div[title="' + userid + '"]')
        .wait('#clickable-edituser')
        .click('#clickable-edituser')
        .wait('#adduser_group')
        .xtract('id("adduser_group")/option[contains(.,"' + gid + '" )]/@value')
        .then(function(result) {
          communityid = result
          done()
          console.log('        (found patron group ID ' + communityid + ")")
        })
        .catch(done)
      })
      it('should edit user record using "' + gid + '" group', done => {
        nightmare
        .select('#adduser_group', communityid)
        .type('#adduser_preferredcontact','e')
        .click('#clickable-updateuser')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should fail at deleting "' + gid + '" group', done => {
        nightmare
        .wait(1111)
        .click(config.select.settings)
        .wait(wait)
        .click('a[href="/settings/users"]')
        .wait('a[href="/settings/users/groups"]')
        .click('a[href="/settings/users/groups"]')
	.wait(function(dp) {
	  var dnode = document.evaluate(dp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
	  if (dnode.singleNodeValue) {
	    return true
	  }
	  else {
	    return false
	  }
	},deletePath)
	.wait(222)
        .xclick(deletePath)
        .click('a[href="/settings/users/addresstypes"]')
        .wait(wait)
	.xclick('//button[starts-with(.,"Discard")]')
        .wait(wait)
        .click('a[href="/settings/users/groups"]')
        .wait(wait)
        .evaluate(function(gid) {
          var cnode = document.evaluate('//div[.="' + gid + '"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          if (!cnode.singleNodeValue) {
            throw new Error(gid + ' patron group NOT found after clicking "Delete" button!')
          }
        }, gid)
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(function(result) { 
          done()
         })
        .catch(done)
      })
      it('should find ID for "Staff" group', done => {
        nightmare
        .click('#clickable-users-module')
        .wait('#input-user-search')
        .click('button[class*="headerSearchClearButton"]')
        .insert('#input-user-search', userid)
	.wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .wait('div[title="' + userid + '"]')
        .click('div[title="' + userid + '"]')
        .wait('#clickable-edituser')
        .click('#clickable-edituser')
        .wait('#adduser_group')
        .xtract('id("adduser_group")/option[contains(.,"Staff")]/@value')
        .then(function(result) {
          staffid = result
          done()
          console.log('        (found "Staff" group ID ' + staffid +")")
        })
        .catch(done)
      })
      it('should change patron group to "Staff" in user record', done => {
        nightmare
        .select('#adduser_group', staffid)
        .click('#clickable-updateuser')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should delete "' + gid + '" patron group', done => {
        nightmare
        .wait(1111)
        .xclick('//span[.="Settings"]')
        .wait(wait)
        .xclick('id("ModuleContainer")//a[.="Users"]')
        .wait(wait)
        .xclick('id("ModuleContainer")//a[.="Patron groups"]')
	.wait(function(dp) {
	  var dnode = document.evaluate(dp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
	  if (dnode.singleNodeValue) {
	    return true
	  }
	  else {
	    return false
	  }
	},deletePath)
        .xclick(deletePath)
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      }) 
      it('should confirm that "' + gid + '" patron group has been deleted', done => {
        nightmare
	.wait(wait)
        .evaluate(function(gid) {
          var cnode = document.evaluate('//div[.="' + gid + '"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          if (cnode.singleNodeValue) {
            throw new Error(gid + ' patron group found after clicking "Delete" button!')
          }
        }, gid)
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      }) 
      flogout();
    })
  })


}
