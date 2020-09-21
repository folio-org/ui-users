import { createInteractor } from '@bigtest/interactor';

export default createInteractor('table row')({
  selector: '[role=row]',
  defaultLocator: element => element.textContent,
  locators: {
    findByRowNumber: element => element.ariaRowIndex - 1,
    findByDataRowIndex: element => element.getAttribute('data-row-index')
  }
});
