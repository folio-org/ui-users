import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('table cell')({
  selector: '[role=gridcell]',
  defaultLocator: element => element.textContent,
  filters: {
    rowNumber: element => {
      const headerRowOffset = 2;
      return element.closest('[role=row]').getAttribute('aria-rowindex') - headerRowOffset;
    },
    columnTitle: element => {
      const siblingCells = Array.from(element.closest('[class^=mclRow-]').querySelectorAll('[role=gridcell]'));
      let position = -1;

      for (const cell of siblingCells) {
        position++;
        if (cell === element) {
          break;
        }
      }

      const headerAtPosition = Array.from(
        element.closest('[class^=mclContainer-]')
          ?.querySelector('[class^=mclHeaderRow-]')
          ?.querySelectorAll('[role=columnheader]')
      )[position];

      return headerAtPosition.textContent;
    }
  },
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
