import {
  interactor,
  text,
} from '@bigtest/interactor';

@interactor class CellInteractor {
  content = text();
}

export default CellInteractor;
