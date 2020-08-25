import { test } from '@bigtest/suite';
import { App, createInteractor, perform } from '@bigtest/interactor';
import { bigtestGlobals } from '@bigtest/globals';
import { start, store } from '../helpers/server';

// import setupApplication from '../helpers/setup-application';

const Header = createInteractor('header')({
  selector: 'h1, h2, h3, h4, h5, h6'
});

const TextField = createInteractor('text field')({
  selector: 'input[type=text], input[type=password]',
  defaultLocator: element => element.labels[0].textContent,
  filters: {
    enabled: {
      apply: element => !element.disabled,
      default: true
    }
  },
  actions: {
    fill: perform((element, value) => {
      const descriptor = Object.getOwnPropertyDescriptor(element, 'value');
      if (descriptor) delete element.value;
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      if (descriptor) {
        Object.defineProperty(element, 'value', descriptor);
      }
    })
  }
});

const Button = createInteractor('button')({
  selector: 'button',
  filters: {
    enabled: {
      apply: element => !element.disabled,
      default: true
    }
  },
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});

bigtestGlobals.defaultInteractorTimeout = 6000;

export default test('application')
  .step('start simulated server', async () => {
    start();
  })
  .step('visit root url', async () => {
    await App.visit();
  })
  .step('log in', async () => {
    await TextField('Username').fill('testuser');
    await TextField('Password').fill('password');
    await Button('Log in').click();
  })
  .child('loan detail', test => test
    .step('initialize backing data', async () => {
      return {
        user: store.create('user'),
        loan: store.create('loan')
      };
    })
    .step('visit user\'s loan', async ({ user, loan }) => {
      console.log('🚌', 'user:', user.id, 'loan:', loan.id);
      // debugger;
      // window.location.pathname = `/users/view/${user.id}?layer=loan&loan=${loan.id}`;
    }));

// describe('Application', function () {
//   this.timeout(4000);

//   const app = new Application();

//   setupApplication();

//   describe('home', () => {
//     beforeEach(function () {
//       this.visit('/');
//     });

//     it('renders', () => {
//       expect(app.isPresent).to.be.true;
//     });
//   });

//   describe('redirect: loan detail', () => {
//     let user;
//     let loan;
//     beforeEach(function () {
//       user = this.server.create('user');
//       loan = this.server.create('loan');
//       this.visit(`/users/view/${user.id}?layer=loan&loan=${loan.id}`);
//     });

//     it('renders', () => {
//       expect(app.isPresent).to.be.true;
//     });

//     it('redirects to loan detail view', function () {
//       expect(this.location.pathname).to.equal(`/users/${user.id}/loans/view/${loan.id}`);
//     });
//   });

//   describe('redirect: fee fine detail', () => {
//     let user;
//     let account;
//     beforeEach(function () {
//       user = this.server.create('user');
//       account = this.server.create('account');
//       this.visit(`/users/view/${user.id}?layer=account&account=${account.id}`);
//     });

//     it('renders', () => {
//       expect(app.isPresent).to.be.true;
//     });

//     it('redirects to loan detail view', function () {
//       expect(this.location.pathname).to.equal(`/users/${user.id}/accounts/view/${account.id}`);
//     });
//   });

//   describe('redirect: charge fee fine', () => {
//     let user;
//     beforeEach(function () {
//       user = this.server.create('user');
//       this.visit(`/users/view/${user.id}?layer=charge`);
//     });

//     it('renders', () => {
//       expect(app.isPresent).to.be.true;
//     });

//     it('redirects to loan detail view', function () {
//       expect(this.location.pathname).to.equal(`/users/${user.id}/charge`);
//     });
//   });

//   describe('redirect: charge fee fine with loan', () => {
//     let user;
//     let loan;
//     beforeEach(function () {
//       user = this.server.create('user');
//       loan = this.server.create('loan');
//       this.visit(`/users/view/${user.id}?layer=charge&loan=${loan.id}`);
//     });

//     it('renders', () => {
//       expect(app.isPresent).to.be.true;
//     });

//     it('redirects to loan detail view', function () {
//       expect(this.location.pathname).to.equal(`/users/${user.id}/charge/${loan.id}`);
//     });
//   });
// });
