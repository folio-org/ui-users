import {
  interactor,
  text,
  fillable,
} from '@bigtest/interactor';

@interactor class CellInteractor {
  content = text();
    cellsInput = fillable('#editList-settings-owners input[type="text"]');
}

export default CellInteractor;
