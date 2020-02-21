import {
  interactor,
  scoped,
  ButtonInteractor,
} from '@bigtest/interactor';

@interactor class LoansSectionInteractor {
  accordionButton = scoped('#accordion-toggle-button-loansSection', ButtonInteractor);
  openLoans = scoped('#clickable-viewcurrentloans', ButtonInteractor);
  closedLoans = scoped('#clickable-viewclosedloans', ButtonInteractor);

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

export default LoansSectionInteractor;
