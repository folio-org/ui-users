import { createInteractor } from '@bigtest/interactor';

export default createInteractor('charges table')({
  selector: '[role=rowgroup]',
  filters: {
    defaultsCount: element => {
      const allCell = Array.from(element.querySelectorAll('[role=gridcell]'));
      return allCell.filter(x => x.textContent === 'Default').length;
    }
  }
});
