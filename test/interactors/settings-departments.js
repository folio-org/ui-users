import {
  interactor,
  clickable,
  count,
  text,
  scoped,
  collection,
  isPresent,
} from '@bigtest/interactor';

import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor';

@interactor class CellInteractor {
  content = text();
}

@interactor class RowInteractor {
  cells = collection('[class*=mclCell--]', CellInteractor);
  nameInput = new TextFieldInteractor('div:nth-child(1) > [class*=textField--]');
  nameValidationMessage = text('div:nth-child(1) [class*=feedbackError--]');
  codeInput = new TextFieldInteractor('div:nth-child(2) > [class*=textField--]');
  codeValidationMessage = text('div:nth-child(2) [class*=feedbackError--]');
  deleteButtonPresent = isPresent('[id*=clickable-delete-departments-]');
}

@interactor class ListInteractor {
  rows = collection('[class*=editListRow--]', RowInteractor);
  rowCount = count('[class*=editListRow--]');
}

@interactor class DepartmentsInteractor {
  static defaultScope = '#departments';

  paneTitle = text('[data-test-pane-header-title]');
  clickNewButton = clickable('#clickable-add-departments');
  list = scoped('#editList-departments', ListInteractor);

  whenLoaded() {
    return this.when(() => this.isPresent);
  }

  whenListLoaded() {
    return this.when(() => this.list.isPresent).timeout(3000);
  }
}

export default new DepartmentsInteractor();
