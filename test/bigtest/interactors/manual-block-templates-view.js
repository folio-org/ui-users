import {
  attribute,
  collection,
  interactor,
  isPresent,
  scoped,
} from '@bigtest/interactor';

@interactor class BoxInteractor {
  class = attribute('class');
}

@interactor class AccordionInteractor {
  expanded = attribute('aria-expanded');
}

@interactor
class TemplateDetails {
  isLoaded = isPresent('#templateInformation');
  whenLoaded() {
    return this.when(() => this.isLoaded);
  }

  instance = scoped('[data-test-block-template-details]');

  templateInfoAccordion = scoped('#templateInformation');
  blockInfoAccordion = scoped('#blockInformation');

  borrowingIcon = new BoxInteractor('#block-template-borrowing > svg');
  renewalsIcon = new BoxInteractor('#block-template-renewals > svg');
  requestsIcon = new BoxInteractor('#block-template-requests > svg');

  templateInfoAccordionButton = new AccordionInteractor('#accordion-toggle-button-templateInformation');
  blockInfoAccordionButton = new AccordionInteractor('#accordion-toggle-button-blockInformation');
}

@interactor
class ManualBlockTemplates {
  addBlockTemplateButton = scoped('#clickable-create-entry');
  instances = collection('[data-test-nav-list-item] a');

  templateDetails = new TemplateDetails();

  whenLoaded() {
    return this.when(() => this.isLoaded);
  }

  whenListLoaded() {
    return this.when(() => this.list.isPresent).timeout(3000);
  }
}

export default ManualBlockTemplates;
