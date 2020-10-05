import { createInteractor } from '@bigtest/interactor';

export default createInteractor('table row')({
  selector: '[role=row]',
  locator: element => element.textContent,
  filters: {
    dataRowIndex: element => element.getAttribute('data-row-index'),
    rowNumber: element => element.ariaRowIndex - 1
  }
});
