import { createInteractor } from '@bigtest/interactor';

export default createInteractor('table')({
  selector: '[role=grid]',
  locator: element => element.id,
  filters: {
    dataColumnCount: element => {
      return element.querySelectorAll('[role="columnheader"]').length;
    },
    dataRowCount: element => {
      return element.querySelectorAll('[role=row]').length - 1;
    }
  }
});
