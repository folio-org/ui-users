import {
  blurrable,
  clickable,
  count,
  fillable,
  interactor,
  isPresent,
  property,
  text
} from '@bigtest/interactor';

const rowSelector = '[class*=editListRow--]';

@interactor
class InputFieldInteractor {
  clickInput = clickable();
  fillInput = fillable();
  blurInput = blurrable();

  fillAndBlur(val) {
    return this.clickInput()
      .timeout(5000)
      .fillInput(val)
      .timeout(5000)
      .blurInput()
      .timeout(5000);
  }
}

@interactor
class FirstRowInteractor {
  clickEdit = clickable('#clickable-edit-patrongroups-0');
  expirationOffset = new InputFieldInteractor(
    '[name="items[0].expirationOffsetInDays"]'
  );

  isFeedbackErrorPresent = isPresent('[class^="feedbackError---"]');
  feedbackError = text('[class^="feedbackError---"]');
  submitButtonIsDisabled = property('#clickable-save-patrongroups-0', 'disabled');
}

@interactor
class ListInteractor {
  rowCount = count(rowSelector);
}

export default
@interactor
class PatronGroupInteractor {
  groupList = new ListInteractor('#editList-patrongroups');
  firstRow = new FirstRowInteractor();
  whenLoaded() {
    return this.when(() => this.isPresent).timeout(4000);
  }
}
