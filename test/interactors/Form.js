import { createInteractor } from '@bigtest/interactor';

export default createInteractor('link')({
  selector: 'form',
  locator: element => element.getAttributeNames().find(attr => /data-test/.exec(attr)),
  filters: {
    id: element => element.id,
    limitFieldCount: element => element.querySelectorAll('[data-test-limit-field]').length
  }
});
