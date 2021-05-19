import {
  ButtonInteractor,
  clickable,
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor class KeyboardShortcutsModal {
  static defaultScope = '#keyboard-shortcuts-modal';

  modalLabel = scoped('#keyboard-shortcuts-modal-label');
  columnheaderAction = scoped('#list-column-action');
  columnheaderShortcut = scoped('#list-column-shortcut');
  clickShortcutsModalCloseButton = scoped('#keyboard-shortcuts-modal-close', ButtonInteractor);
  modalIcon = scoped('[class*=appIcon]');
}

@interactor class ApplicationContextButton {
  static defaultScope = '[data-test-context-menu-toggle-button]';

  clickAppContextButton = clickable('[data-test-context-menu-toggle-button]');
}

@interactor class ApplicationContextMenu {
  static defaultScope = '#App_context_dropdown_menu';

  keyboardShortcutsItem = scoped('#keyboard-shortcuts-item');
  clickKeyboardShortcutsItem = scoped('#keyboard-shortcuts-item', ButtonInteractor);
}

// https://bigtestjs.io/guides/interactors/introduction/
export default @interactor class ApplicationInteractor {
  static defaultScope = '#ModuleContainer';

  keyboardShortcutsModal = new KeyboardShortcutsModal();
  appContextButton = new ApplicationContextButton();
  appContextMenu = new ApplicationContextMenu();
}
