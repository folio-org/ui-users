import { createInteractor, perform } from '@bigtest/interactor';

export default createInteractor('table cell')({
  selector: '[role=gridcell]',
  locator: element => element.textContent,
  filters: {
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
    },
    rowNumber: element => {
      const headerRowOffset = 2;
      return element.closest('[role=row]').getAttribute('aria-rowindex') - headerRowOffset;
    }
  },
  actions: {
    click: perform((element) => {
      element.click();
    })
  }
});
