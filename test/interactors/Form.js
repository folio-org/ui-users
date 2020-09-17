import { createInteractor } from '@bigtest/interactor';

export default createInteractor('link')({
  selector: 'form',
  defaultLocator: element => element.getAttributeNames().find(attr => /data-test/.exec(attr)),
  filters: {
    limitFieldCount: element => element.querySelectorAll('[data-test-limit-field]').length
  }
});
