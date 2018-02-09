/* global it describe Nightmare before after */
module.exports.test = function foo(uiTestCtx) {
  describe('Module test: users:new_proxy', function bar() {
    const { config, helpers: { login, openApp, getUsers, logout }, meta: { testVersion } } = uiTestCtx;

    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('Login > Find user > Add proxy > Confirm proxy > Logout\n', () => {
      before((done) => {
        login(nightmare, config, done);  // logs in with the default admin credentials
      });
      after((done) => {
        logout(nightmare, config, done);
      });

      it('should open app and find version tag', (done) => {
        nightmare
         .use(openApp(nightmare, config, done, 'users', testVersion))
         .then(result => {
	   done();
	   console.log(result)
	 })
         .catch(done);
      });
      it('should find a user id', (done) => {
        nightmare
        .use(getUsers(nightmare, config, done))
	.then(result => {
	  done()
          console.log(result);
        });
      });
    });
  });
};
