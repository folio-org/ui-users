import {
  interactor,
  isPresent,
  clickable,
  collection,
  text,
  isVisible,
} from '@bigtest/interactor';

@interactor class Button {
  isDisplayed = isVisible();
  click = clickable();
}

@interactor class NotesAccordion {
  isDisplayed = isPresent('#notesAccordion');
  notesLoaded = isPresent('[data-test-notes-accordion-quantity-indicator]');
  toggleAccordion = clickable('#accordion-toggle-button-notesAccordion');

  assignButtonDisplayed = isPresent('[data-test-notes-accordion-assign-button]');
  newButtonDisplayed = isPresent('[data-test-notes-accordion-new-button]');
  clickAssignButton = clickable('[data-test-notes-accordion-assign-button]');
  clickNewButton = clickable('[data-test-notes-accordion-new-button]');

  newButton = new Button('[data-test-notes-accordion-new-button]');
  assignButton = new Button('[data-test-notes-accordion-assign-button]');

  notesListIsDisplayed = isPresent('#notes-list');
  notes = collection('#notes-list [class^="mclRow-"]', {
    click: clickable(),
    title: text('[class^="mclCell":last-child]'),
  });

  whenLoaded() {
    return this.when(() => this.notesLoaded).timeout(3000);
  }
}

export default NotesAccordion;
