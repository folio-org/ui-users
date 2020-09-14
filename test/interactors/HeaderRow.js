import { createInteractor } from '@bigtest/interactor';

export default createInteractor('header')({
  selector: 'div[class^="mclHeaderRow-"]',
  filters: {
    columnRowCount: element => {
      return element.querySelectorAll('[role=columnheader]').length;
    }
  },
});
