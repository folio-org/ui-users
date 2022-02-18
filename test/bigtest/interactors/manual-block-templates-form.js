import {
  clickable,
  interactor,
  text,
} from '@bigtest/interactor';

@interactor class DeleteConfirmation {
  static defaultScope = '#delete-block-template-confirmation';
  clickCancel = clickable('#clickable-delete-block-template-confirmation-cancel');
}

@interactor
class ManualBlockTemplatesForm {
  title = text('[data-test-block-template-edit]');

  deleteConfirmation = new DeleteConfirmation();
  clickDelete = clickable('#clickable-delete-block-template');

  whenLoaded() {
    return this.when(() => this.isLoaded);
  }
}

export default ManualBlockTemplatesForm;
