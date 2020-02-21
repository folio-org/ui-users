import {
  interactor,
  clickable,
  count,
  collection,
} from '@bigtest/interactor';

import CellInteractor from './cell-section';

@interactor class RowInteractor {
  cells = collection('[class*=mclCell---]', CellInteractor);
  cellCount = count('[class*=mclCell---]');
  click = clickable();
}

export default RowInteractor;
