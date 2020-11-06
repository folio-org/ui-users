import {
  collection,
  contains,
  interactor,
  isPresent,
  scoped,
  text,
} from '@bigtest/interactor';

@interactor
class TemplateDetails {
  isLoaded = isPresent('#templateInformation');
  whenLoaded() {
    return this.when(() => this.isLoaded);
  }

  instance = scoped('[data-test-block-template-details]');
  // containsContent = contains('#templateInformation');
  // generalInformationAccordion = new AccordionInteractor('#generalFixedDueDateScheduleDetail');
  // expandAll = scoped('[data-tast-expand-button]')
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
