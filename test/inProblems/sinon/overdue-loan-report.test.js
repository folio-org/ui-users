import { App } from '@bigtest/interactor';
import sinon from 'sinon';
import test from '../helpers/base-steps/simulate-server';
import { store } from '../helpers/server';

export default test('overdue loan report')
  .step('seed data', async () => {
    store.createList('loan', 5, 'borrower');
  })
  .step(App.visit('/users'))
  // .step('sinon', async () => {
  //   const xhr = sinon.useFakeXMLHttpRequest();
  //   const requests = [];
  //   xhr.onCreate = function (req) { requests.push(req); };
  // })