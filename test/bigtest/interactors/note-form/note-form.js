import {
  interactor,
  isPresent,
  clickable,
  text,
} from '@bigtest/interactor';

// eslint-disable-next-line import/no-extraneous-dependencies
import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

import Select from './select-section';
import Button from './button-section';
import FormField from './form-field-section';
import NoteDetailsField from './note-details-field-section';

@interactor class NoteForm {
  closeButton = new Button('[data-test-leave-note-form]');
  saveButton = new Button('[data-test-save-note]');
  formFieldsAccordionIsDisplayed = isPresent('#noteForm');
  assignmentInformationAccordionIsDisplayed = isPresent('#assigned');
  noteTypesSelect = new Select('[data-test-note-types-field]');
  noteTitleField = new FormField('[data-test-note-title-field]');
  noteDetailsField = new NoteDetailsField('.ql-editor');
  hasTitleLengthError = isPresent('[data-test-character-limit-error="title"]');
  hasTitleMissingError = isPresent('[data-test-title-missing-error]');
  navigationModalIsOpened = isPresent('#navigation-modal');
  clickCancelNavigationButton = clickable('[data-test-navigation-modal-dismiss]');
  clickContinueNavigationButton = clickable('[data-test-navigation-modal-continue]');
  referredEntityType = text('[data-test-referred-entity-type]');
  referredEntityName = text('[data-test-referred-entity-name]');
  clickPaneHeaderButton = clickable('[class^="paneHeaderCenterButton"]');
  clickDropdownCancelButton = clickable('[data-test-leave-note-form]');
  assignmentAccordion = new AccordionInteractor('#assigned');

  enterNoteData(noteType, noteTitle) {
    return this.noteTypesSelect.selectAndBlur(noteType)
      .noteTitleField.enterText(noteTitle);
  }

  openDropdownAndClickCloseButton() {
    return this.clickPaneHeaderButton()
      .clickDropdownCancelButton();
  }
}

export default NoteForm;
