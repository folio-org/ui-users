import {
  interactor,
  isPresent,
  count,
  text
} from '@bigtest/interactor';

@interactor class ConditionSettings {
  hasList = isPresent('[data-test-nav-list]');
  conditionsCount = count('[data-test-nav-list] a');
  conditionsForm = isPresent('[class*=conditionsWrapper]');
  formHeader = text('[class*=paneTitleLabel]');
}

export default new ConditionSettings('#ModuleContainer section:nth-child(3)');
