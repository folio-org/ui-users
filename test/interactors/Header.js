import { createInteractor } from '@bigtest/interactor';

export default createInteractor('header')({
  selector: 'h1, h2, h3, h4, h5, h6',
  locators: {
    findByAttribute: element => element.getAttributeNames().find(attr => /data-test/.exec(attr))
  },
  filters: {
    attribute: element => element.getAttributeNames().find(attr => /data-test/.exec(attr))
  },
});
