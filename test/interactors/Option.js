import { createInteractor } from '@bigtest/interactor';

export default createInteractor('option')({
  selector: 'option',
  locator: element => element.textContent,
  filters: {
    value: element => element.value
  }
});
