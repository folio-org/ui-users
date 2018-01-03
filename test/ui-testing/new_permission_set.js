module.exports.test = function(uiTestCtx) {

  describe('Module test: users:new_permission_set', function () {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;

    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout))
    const wait = 222;

    describe("Login > Create new permission set > Confirm creation > Delete permission set > Confirm deletion > Logout\n", () => {
      
      let displayName = 'Circulation employee'
      let description = 'Contains permissions to execute basic circ functions.'
      let uuid = null

      before( done => {
        login(nightmare, config, done);  // logs in with the default admin credentials
      })
      after( done => {
        logout(nightmare, config, done);  
      })

      it('should open app and find version tag', done => {
        nightmare
         .use(openApp(nightmare, config, done, 'users', testVersion ))
         .then(result => result )
	 .catch(done)
      })
      it('should create a new permission set', done => {
        nightmare
        .click(config.select.settings)
        .wait('a[href="/settings/users"]')
        .click('a[href="/settings/users"]')
        .wait('a[href="/settings/users/perms"]')
        .click('a[href="/settings/users/perms"]')
	.wait('button[title^="Add "]')
	.click('button[title^="Add "]')
	.wait('#input-permission-title')
	.insert('#input-permission-title', displayName)
	.insert('#input-permission-description', description)
	.click('#clickable-add-permission')
	.wait(555)
	.xclick('//button[contains(.,"Check in")]')
	.wait(555)
	.click('#clickable-add-permission')
	.wait(555)
	.xclick('//button[contains(.,"Check out")]')
	.wait(555)
	.click('#clickable-save-permission-set')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should confirm creation of new permission set', done => {
        nightmare
        .click(config.select.settings)
        .wait('a[href="/settings/users"]')
        .click('a[href="/settings/users"]')
        .wait('a[href="/settings/users/perms"]')
        .click('a[href="/settings/users/perms"]')
	.wait(555)
	.xclick('//a[.="' + displayName + '"]')
	.wait('#clickable-edit-item')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should delete new permission set', done => {
        nightmare
	.click('#clickable-edit-item')
	.wait('#clickable-delete-set')
	.click('#clickable-delete-set')
	.wait(333)
	.click('div[role="dialog"] button:nth-of-type(2)')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
	.url()
        .then(result => { 
	  done()
	  uuid = result
	  uuid = uuid.replace(/^.+\//,"")
	  console.log('          ID of deleted permission set: ' + uuid)
	})
        .catch(done)
      })
      it('should confirm deletion', done => {
        nightmare
	.wait(222)
	.click('a[href^="/settings/users/groups"]')
	.wait(222)
        .click('a[href="/settings/users/perms"]')
	.wait(222)
	.evaluate(function(uuid) {
	   var element = document.querySelector('a[href*="' + uuid + '"]')
	   if (element) {
	     throw new Error('Failed at deleting ' + uuid)
	   }
	}, uuid)
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
    })
  })
}
