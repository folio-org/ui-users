/* global it describe Nightmare before after */
module.exports.test = function foo(uiTestCtx) {
  describe('Module test: users:new_proxy', function bar() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;

    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('Login > Find user > Add proxy > Confirm proxy > Logout\n', () => {
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
      it('should find a user id', (done) => {
        nightmare
          .click('#clickable-users-module')
          .wait('#list-users div[role="listitem"]:nth-child(8) > a')
          .click('#list-users div[role="listitem"]:nth-child(8) > a')
          .wait('#clickable-edituser')
          .click('#clickable-edituser')
          .wait('#proxy h2')
          .click('#proxy h2')
          .wait(parseInt(process.env.FOLIO_UI_DEBUG, 10) ? parseInt(config.debug_sleep, 10) : 555) // debugging
          .then(() => { done(); })
          .catch(done);
      });
    });
  });
};
