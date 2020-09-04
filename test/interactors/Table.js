import { createInteractor } from '@bigtest/interactor';

export default createInteractor('table')({
  selector: '[role=grid]',
  defaultLocator: () => '',
  filters: {
    dataRowCount: element => {
      return element.querySelectorAll('[role=row]').length - 1;
    },
  }
});
