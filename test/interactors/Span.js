import { createInteractor } from '@bigtest/interactor';

export default createInteractor('span')({
  selector: 'span',
  locator: element => element.getAttributeNames().find(attr => /data-test/.exec(attr)),
  filters: {
    value: element => element.textContent
  }
});
