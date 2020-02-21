import {
  interactor,
  clickable,
  text,
} from '@bigtest/interactor';

@interactor class CellInteractor {
  content = text();
  selectOneWarning = clickable('input[type="checkbox"]');
}

export default CellInteractor;
