import {
  interactor,
  scoped,
  collection
} from '@bigtest/interactor';

export default @interactor class UsersInteractor {
  static defaultScope = '[data-test-user-instances]';

  instances = collection('[role=row] a');
  instance = scoped('[data-test-instance-details]');
}
