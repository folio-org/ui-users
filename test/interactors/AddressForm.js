import { createInteractor } from '@bigtest/interactor';

export default createInteractor('list item')({
  selector: 'li',
  locator: element => element.querySelector('div[class^="addressLabel-"]').textContent
});
