import {
  interactor,
  scoped,
  ButtonInteractor,
} from '@bigtest/interactor';

@interactor class LoansListingPane {
  static defaultScope = '#pane-loanshistory';

  closeButton = scoped('button[icon=times]', ButtonInteractor);

  whenLoaded() {
    return this.when(() => this.list.isVisible).timeout(4000);
  }
}

export default new LoansListingPane();
