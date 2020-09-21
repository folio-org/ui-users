import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('list item')({
  selector: 'li',
  locators: {
    findByHeaderLabel: element => element.querySelector('div[class^="addressLabel-"]').textContent,
  }
});
