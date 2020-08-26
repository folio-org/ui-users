import {
  interactor,
  clickable,
  text,
  isPresent,
  collection
} from '@bigtest/interactor';

// eslint-disable-next-line import/no-extraneous-dependencies
import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor';

@interactor class Comments {
  commentRequiredTitle = text('#form-require-comment h2');
  pay = new SelectInteractor('#paid');
  waive = new SelectInteractor('#waived');
  refund = new SelectInteractor('#refunded');
  transfer = new SelectInteractor('#transferredManually');
  data = collection('[class*=col-xs--]');
  save = clickable('#clickable-save-comment');
  whenLoaded() {
    return this.when(() => this.isLoaded);
  }

  isLoaded = isPresent('#form-require-comment');
}

export default new Comments();
