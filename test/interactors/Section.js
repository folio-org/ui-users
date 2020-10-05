import { createInteractor } from '@bigtest/interactor';

export default createInteractor('section')({
  selector: 'section',
  locator: element => element.id,
  filters: {
    attribute: element => element.getAttributeNames().find(attr => /data-test/.exec(attr)),
    id: element => element.id
  }
});
