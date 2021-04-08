import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class UserNotFoundPage {
  userNotFoundPanePresent = isPresent('#pane-user-not-found-content');

  whenLoaded() {
    return this.when(() => this.isPresent).timeout(5000);
  }
}

export default new UserNotFoundPage('#pane-user-not-found');
