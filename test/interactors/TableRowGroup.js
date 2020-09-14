import { createInteractor } from '@bigtest/interactor';

export default createInteractor('table cell')({
  selector: '[role=rowgroup]',
  defaultLocator: element => element.textContent,
  filters: {
    dataRowCount: element => {
      return element.querySelectorAll('[role=row]').length;
    }
  }
});
