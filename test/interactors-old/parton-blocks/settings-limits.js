import {
  interactor,
  isPresent,
  count,
} from '@bigtest/interactor';

@interactor class LimitSettings {
  hasList = isPresent('[data-test-nav-list]');
  limitsCount = count('[data-test-nav-list-item]');
}

export default new LimitSettings('#ModuleContainer section:nth-child(3)');
