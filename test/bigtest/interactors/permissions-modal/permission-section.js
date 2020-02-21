import {
  interactor,
  scoped,
  property,
} from '@bigtest/interactor';

@interactor class Permission {
  checkBox = scoped('[data-test-select-item] input');
  assigned = property('[data-test-select-item] input', 'checked');
  name = scoped('[data-test-permission-name]');
  status = scoped('[data-test-permission-status]');
}

export default Permission;
