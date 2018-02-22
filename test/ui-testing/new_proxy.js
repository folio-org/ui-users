/* global it describe Nightmare before after */
module.exports.test = function foo(uiTestCtx) {
  describe('Module test: users:new_proxy', function bar() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;

    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('Login > Find user > Add proxy > Confirm proxy > Logout\n', () => {

      let userBarcodes = [];
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

      it('should get active user barcodes', (done) => {
        nightmare
          .click('#clickable-users-module')
          .wait('#list-users div[role="listitem"]:nth-child(9)')
	  .evaluate(() => {
	    let ubc = [];
	    const list = document.querySelectorAll('#list-users div[role="listitem"]');
	    list.forEach((node) => {
	     let status = node.querySelector('a div:nth-child(1)').innerText;
	     let barcode = node.querySelector('a div:nth-child(3)').innerText;
	     if (barcode && status.match(/Active/)) {
	       ubc.push(barcode);
	     }
	    });
	    return ubc;
	  })
	  .then(result => {
	    done();
	    userBarcodes = result;
	  })
	  .catch(done);
      });

      it('should add a proxy for', (done) => {
        nightmare
	  .insert('#input-user-search', userBarcodes[0])
          .wait('#clickable-edituser')
          .click('#clickable-edituser')
          .wait('#proxy > div > div > button')
          .click('#proxy > div > div > button')
	  .wait('#proxy > div > div > div > div:nth-child(1) button')
	  .click('#proxy > div > div > div > div:nth-child(1) button')
	  .wait('div[aria-label="Select User"] #input-user-search')
	  .insert('div[aria-label="Select User"] #input-user-search', userBarcodes[1])
	  .wait(2222)
          .wait('div[aria-label="Select User"] #list-users div[role="listitem"] > a')
          .click('div[aria-label="Select User"] #list-users div[role="listitem"] > a')
	  .wait('#clickable-updateuser')
	  .click('#clickable-updateuser')
	  .wait(2222)
          .then(() => { done(); })
          .catch(done);
      }); 

      it('should delete a sponsor of', (done) => {
        nightmare
	  //.wait('#input-user-search')
	  .wait(4444)
	  .evaluate(() => {
	    document.querySelector('#input-user-search').value = '';
	  })
	  .insert('#input-user-search', userBarcodes[1])
	  .wait(`#list-users div[role="listitem"] > a > div[title="${userBarcodes[1]}"]`)
	  .wait(222)
          .click('#clickable-edituser')
          .wait('#proxy > div > div > button')
          .click('#proxy > div > div > button')
	  .wait('#proxy > div > div > div > div:nth-child(2) button')
	  .click('#proxy > div > div > div > div:nth-child(2) button')
	  // .wait('#clickable-updateuser')
	  // .click('#clickable-updateuser')
	  .wait(555)
          .then(() => { done(); })
          .catch(done);
      }); 
    });
  });
};
