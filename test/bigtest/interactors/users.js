import {
  interactor,
  scoped,
  collection,
  clickable
} from '@bigtest/interactor';

export default @interactor class UsersInteractor {
  static defaultScope = '[data-test-user-instances]';
  clickInactiveUsersCheckbox = clickable('#clickable-filter-active-active');
  clickFacultyCheckbox = clickable('#clickable-filter-pg-faculty');
  clickGraduateCheckbox = clickable('#clickable-filter-pg-graduate');
  clickStaffCheckbox = clickable('#clickable-filter-pg-staff');
  clickUndergradCheckbox = clickable('#clickable-filter-pg-undergrad');
  instances = collection('[role=row] a');
  instance = scoped('[data-test-instance-details]');
}
