import {
  interactor,
  clickable,
  text,
} from '@bigtest/interactor';

@interactor class CellInteractor {
  content = text();
  selectOne = clickable('input[type="checkbox"]');
  selectEllipsis = clickable('[data-test-ellipsis-button]');
}

export default CellInteractor;
