import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

export default @interactor class FindUserInstances {
  instancesPresent = isPresent('#OverlayContainer [role=group] [role=row]');

  whenInstancesLoaded() {
    return this.when(() => this.instancesPresent).timeout(5000);
  }
}
