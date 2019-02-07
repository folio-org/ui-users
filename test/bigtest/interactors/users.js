import {
  interactor,
  scoped,
  collection,
  clickable
} from '@bigtest/interactor';

export default @interactor class UsersInteractor {
  static defaultScope = '[data-test-user-instances]';
  clickInactiveUsersCheckbox = clickable('[name="active.Include inactive users"]');
  instances = collection('[role=row] a');
  instance = scoped('[data-test-instance-details]');
}
