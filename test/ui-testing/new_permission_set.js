module.exports.test = function(uiTestCtx) {

  describe('Module test: users:new_permission_set', function () {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;

    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout))
    const wait = 222;

    describe("Login > Create new permission set > Confirm creation > Delete permission set > Confirm deletion > Logout\n", () => {
      
      let displayName = 'Circulation employee'
      let description = 'Contains permissions to execute basic circ functions.'

      before( done => {
        login(nightmare, config, done);  // logs in with the default admin credentials
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
	.wait('#displayName')
	.insert('#displayName', displayName)
	.insert('#permissionset_description', description)
	.click('#AddPermissionDropdown')
	.wait(555)
	.xclick('//button[contains(.,"Check in")]')
	.wait(555)
	.click('#AddPermissionDropdown')
	.wait(555)
	.xclick('//button[contains(.,"Check out")]')
	.wait(555)
	.click('button[title^="Save"]')
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
	.wait('button[title="Edit"]')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should delete new permission set', done => {
        nightmare
	.click('button[title="Edit"]')
	.wait('button[title^="Delete"]')
	.click('button[title^="Delete"]')
	.wait('#Delete Permission Set?')
	.click('#Delete Permission Set? button:nth-of-type(2)')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
	.end()
        .then(result => { done() })
        .catch(done)
      })
    })
  })
}
