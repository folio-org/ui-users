import { createInteractor } from '@bigtest/interactor';

export default createInteractor('section')({
  selector: 'section',
  defaultLocator: element => element.id,
  locators: {
    findByAttribute: element => element.getAttributeNames().find(attr => /data-test/.exec(attr))
  },
  filters: {
    id: element => element.id
  }
});
