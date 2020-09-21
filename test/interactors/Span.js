import { createInteractor } from '@bigtest/interactor';

export default createInteractor('span')({
  selector: 'span',
  defaultLocator: element => element.getAttributeNames().find(attr => /data-test/.exec(attr)),
  locators: {
    findByTextContent: element => element.textContent
  },
  filters: {
    value: element => element.textContent
  }
});
