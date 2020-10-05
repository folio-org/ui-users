import { createInteractor } from '@bigtest/interactor';

export default createInteractor('table cell')({
  selector: '[role=rowgroup]',
  locator: element => element.textContent,
  filters: {
    dataRowContainerCount: element => {
      return element.querySelectorAll('div[class^="mclRowFormatterContainer-"]').length;
    },
    dataRowCount: element => {
      return element.querySelectorAll('[role=row]').length;
    }
  }
});
