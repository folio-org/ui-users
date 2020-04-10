import {
  interactor,
  isPresent,
  count,
} from '@bigtest/interactor';

@interactor class ConditionSettings {
  hasList = isPresent('[data-test-nav-list]');
  conditionsCount = count('[data-test-nav-list] a');
}

export default new ConditionSettings('#ModuleContainer section:nth-child(3)');
