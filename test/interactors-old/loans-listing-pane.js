import {
  interactor,
  scoped,
  isPresent,
  ButtonInteractor,
} from '@bigtest/interactor';

@interactor class LoansListingPane {
  static defaultScope = '#pane-loanshistory';

  isCloseButtonVisible = isPresent('#pane-loanshistory button[icon=times]');
  closeButton = scoped('button[icon=times]', ButtonInteractor);

  whenLoaded() {
    return this.when(() => this.isCloseButtonVisible).timeout(4000);
  }
}

export default new LoansListingPane();
