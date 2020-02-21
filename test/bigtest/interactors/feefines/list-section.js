import {
  interactor,
  count,
  collection,
} from '@bigtest/interactor';

import RowInteractor from './row-section';

const rowSelector = '[class*=editListRow--]';

@interactor class ListInteractor {
  rowCount = count(rowSelector);
  rows = collection(rowSelector, RowInteractor);
}

export default ListInteractor;
