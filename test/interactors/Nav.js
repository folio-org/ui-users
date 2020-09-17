import { createInteractor } from '@bigtest/interactor';

export default createInteractor('nav')({
  selector: 'nav',
  defaultLocator: element => element.getAttribute('aria-label'),
  filters: {
    listCount: element => element.querySelectorAll('[data-test-nav-list-item=true]').length
  }
});
