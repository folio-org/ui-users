import { createInteractor } from '@bigtest/interactor';

export default createInteractor('div')({
  selector: 'div',
  locator: element => element.textContent,
  filters: {
    ariaLabelledBy: element => element.getAttribute('aria-labelledby'),
    attribute: element => element.getAttributeNames().find(attr => /data-test/.exec(attr)),
    id: element => element.id,
    sectionsCount: element => element.querySelectorAll('section').length,
    value: element => element.textContent
  },
});
