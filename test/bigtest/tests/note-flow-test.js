import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import faker from 'faker';

import setupApplication from '../helpers/setup-application';
import NotesAccordion from '../interactors/notes-accordion';
import NoteForm from '../interactors/note-form';
import NoteView from '../interactors/note-view';
import InstanceViewPage from '../interactors/user-view-page';
import { getFullName } from '../../../src/components/util';

const notesAccordion = new NotesAccordion();
const noteForm = new NoteForm();
const noteView = new NoteView();

describe('User notes flow', function () {
  setupApplication();

  let user;
  let userNote;
  let noteType;

  beforeEach(async function () {
    user = this.server.create('user');

    noteType = this.server.create('note-type', {
      id: 'noteType1',
      name: 'Test note type',
    });

    userNote = this.server.create('note', {
      type: noteType.name,
      typeId: noteType.id,
      links: [{ type: 'user', id: user.id }],
    });

    this.server.create('note', {
      type: noteType.name,
      typeId: noteType.id,
      links: [{ type: 'user', id: 'someId' }],
    });

    this.server.create('note', {
      type: noteType.name,
      typeId: noteType.id,
      links: [{ type: 'user', id: 'someId2' }],
    });

    this.visit(`/users/preview/${user.id}`);
  });

  describe('when the user details pane is visited', () => {
    beforeEach(async function () {
      this.visit(`/users/preview/${user.id}`);
      await notesAccordion.toggleAccordion();
    });

    it('should display notes accordion', () => {
      expect(notesAccordion.isDisplayed).to.be.true;
    });

    it('notes accordion should contain 1 note', () => {
      expect(notesAccordion.notes().length).to.equal(1);
    });

    it('should display create note button', () => {
      expect(notesAccordion.newButtonDisplayed).to.be.true;
    });

    it('should display notes list', () => {
      expect(notesAccordion.notesListIsDisplayed).to.be.true;
    });

    describe('and new button was clicked', () => {
      beforeEach(async () => {
        await notesAccordion.newButton.click();
      });

      it('should open create note page', function () {
        expect(this.location.pathname).to.equal('/users/notes/new');
      });

      it('displays assignment accordion as closed', () => {
        expect(noteForm.assignmentAccordion.isOpen).to.equal(false);
      });

      it('should disable save button', () => {
        expect(noteForm.saveButton.isDisabled).to.be.true;
      });

      describe('and close button was clicked', () => {
        beforeEach(async () => {
          await noteForm.closeButton.click();
        });

        it('should redirect to previous location', function () {
          expect(this.location.pathname + this.location.search).to.equal(`/users/preview/${user.id}`);
        });
      });

      describe('and the form is touched', () => {
        describe('and note title length is exceeded', () => {
          beforeEach(async () => {
            await noteForm.noteTitleField.enterText(faker.lorem.words(100));
          });

          it('should display title length error', () => {
            expect(noteForm.hasTitleLengthError).to.be.true;
          });

          describe('and save button is clicked', () => {
            beforeEach(async () => {
              await noteForm.saveButton.click();
            });

            it('should not redirect to previous location', function () {
              expect(this.location.pathname + this.location.search).to.equal('/users/notes/new');
            });
          });
        });

        describe('and correct note data was entered', () => {
          beforeEach(async () => {
            await noteForm.enterNoteData(noteType.name, 'some note title');
          });

          it('should enable save button', () => {
            expect(noteForm.saveButton.isDisabled).to.be.false;
          });

          describe('and close button was clicked', () => {
            beforeEach(async () => {
              await noteForm.closeButton.click();
            });

            it('should display navigation modal', function () {
              expect(noteForm.navigationModalIsOpened).to.be.true;
            });

            describe('and cancel navigation button was clicked', () => {
              beforeEach(async () => {
                await noteForm.clickCancelNavigationButton();
              });

              it('should close navigation modal', () => {
                expect(noteForm.navigationModalIsOpened).to.be.false;
              });

              it('should keep the user on the same page', function () {
                expect(this.location.pathname + this.location.search).to.equal('/users/notes/new');
              });
            });

            describe('and continue navigation button was clicked', () => {
              beforeEach(async () => {
                await noteForm.clickContinueNavigationButton();
              });

              it('should close navigation modal', () => {
                expect(noteForm.navigationModalIsOpened).to.be.false;
              });

              it('should redirect to previous page', function () {
                expect(this.location.pathname + this.location.search).to.equal(`/users/preview/${user.id}`);
              });
            });
          });

          describe('and save button was clicked', () => {
            beforeEach(async () => {
              await noteForm.saveButton.click();
              await InstanceViewPage.whenLoaded();
            });

            it('should redirect to previous page', function () {
              expect(this.location.pathname).to.equal(`/users/preview/${user.id}`);
            });

            it('notes accordion should contain 2 notes', () => {
              expect(notesAccordion.notes().length).to.equal(2);
            });
          });
        });
      });
    });

    describe('and a note in the notes list was clicked', () => {
      beforeEach(async () => {
        await notesAccordion.notes(0).click();
      });

      it('should redirect to note view page', function () {
        expect(this.location.pathname + this.location.search).to.equal(`/users/notes/${userNote.id}`);
      });

      it('should display general information accordion', () => {
        expect(noteView.generalInfoAccordionIsDisplayed).to.be.true;
      });

      it('should display correct note type', () => {
        expect(noteView.noteType).to.equal(userNote.type);
      });

      it('should display correct note title', () => {
        expect(noteView.noteTitle).to.equal(userNote.title);
      });

      it('should display correct note details', () => {
        expect(noteView.noteDetails).to.equal(userNote.content);
      });

      it('should display assignments information accordion', () => {
        expect(noteView.assignmentInformationAccordionIsDisplayed).to.be.true;
      });

      it('displays assignment accordion as closed', () => {
        expect(noteView.assignmentAccordion.isOpen).to.equal(false);
      });

      it('should display correct referred entity type', () => {
        expect(noteView.referredEntityType.toLowerCase()).to.equal('user');
      });

      it('should display correct referred entity name', () => {
        expect(noteView.referredEntityName).to.equal(getFullName(user).trim());
      });

      describe('and close button is clicked', () => {
        beforeEach(async () => {
          await noteView.clickCancelButton();
        });

        it('should redirect to previous location', function () {
          expect(this.location.pathname + this.location.search).to.equal(`/users/preview/${user.id}`);
        });
      });

      describe('and delete button was clicked', async () => {
        beforeEach(async () => {
          await noteView.performDeleteNoteAction();
        });

        it('should open confirmation modal', () => {
          expect(noteView.deleteConfirmationModalIsDisplayed).to.be.true;
        });

        describe('and cancel button was clicked', () => {
          beforeEach(async () => {
            await noteView.deleteConfirmationModal.clickCancelButton();
          });

          it('should close confirmation modal', () => {
            expect(noteView.deleteConfirmationModalIsDisplayed).to.be.false;
          });
        });

        describe('and confirm button was clicked', () => {
          beforeEach(async () => {
            await noteView.deleteConfirmationModal.clickConfirmButton();
          });

          it('should redirect to user details page', function () {
            expect(this.location.pathname + this.location.search).to.equal(`/users/preview/${user.id}`);
          });
        });
      });

      describe('and edit button is clicked', () => {
        beforeEach(async () => {
          await noteView.clickEditButton();
        });

        it('should redirect to note edit page', function () {
          expect(this.location.pathname + this.location.search).to.equal(`/users/notes/${userNote.id}/edit`);
        });

        it('should display general information accordion', () => {
          expect(noteForm.formFieldsAccordionIsDisplayed).to.be.true;
        });

        it('should display correct note title', () => {
          expect(noteForm.noteTitleField.value).to.equal(userNote.title);
        });

        it('should display correct note type', () => {
          expect(noteForm.noteTypesSelect.value).to.equal(noteType.id);
        });

        it('should display correct note details', () => {
          expect(noteForm.noteDetailsField.value).to.equal(userNote.content);
        });

        it('should display assignments information accordion', () => {
          expect(noteForm.assignmentInformationAccordionIsDisplayed).to.be.true;
        });

        it('should display correct referred entity type', () => {
          expect(noteForm.referredEntityType.toLowerCase()).to.equal('user');
        });

        it('should display correct referred entity name', () => {
          expect(noteForm.referredEntityName).to.equal(getFullName(user).trim());
        });

        it('should disable save button', () => {
          expect(noteForm.saveButton.isDisabled).to.be.true;
        });

        describe('and dropdown close button is clicked', () => {
          beforeEach(async () => {
            await noteForm.openDropdownAndClickCloseButton();
          });

          it('should redirect to previous page', function () {
            expect(this.location.pathname + this.location.search).to.equal(`/users/notes/${userNote.id}`);
          });
        });

        describe('and the form is touched', () => {
          describe('and note title length is exceeded', () => {
            beforeEach(async () => {
              await noteForm.noteTitleField.enterText(faker.lorem.words(100));
            });

            it('should display title length error', () => {
              expect(noteForm.hasTitleLengthError).to.be.true;
            });

            describe('and save button is clicked', () => {
              beforeEach(async () => {
                await noteForm.saveButton.click();
              });

              it('should not redirect to previous location', function () {
                expect(this.location.pathname + this.location.search).to.equal(`/users/notes/${userNote.id}/edit`);
              });
            });
          });

          describe('and correct note data was entered', () => {
            beforeEach(async () => {
              await noteForm.enterNoteData(noteType.name, 'some note title');
            });

            it('should enable save button', () => {
              expect(noteForm.saveButton.isDisabled).to.be.false;
            });

            describe('and close button was clicked', () => {
              beforeEach(async () => {
                await noteForm.closeButton.click();
              });

              it('should display navigation modal', function () {
                expect(noteForm.navigationModalIsOpened).to.be.true;
              });

              describe('and cancel navigation button was clicked', () => {
                beforeEach(async () => {
                  await noteForm.clickCancelNavigationButton();
                });

                it('should close navigation modal', () => {
                  expect(noteForm.navigationModalIsOpened).to.be.false;
                });

                it('should keep the user on the same page', function () {
                  expect(this.location.pathname + this.location.search).to.equal(`/users/notes/${userNote.id}/edit`);
                });
              });

              describe('and continue navigation button was clicked', () => {
                beforeEach(async () => {
                  await noteForm.clickContinueNavigationButton();
                });

                it('should close navigation modal', () => {
                  expect(noteForm.navigationModalIsOpened).to.be.false;
                });

                it('should redirect to previous page', function () {
                  expect(this.location.pathname + this.location.search).to.equal(`/users/notes/${userNote.id}`);
                });
              });
            });

            describe('and dropdown close button was clicked', () => {
              beforeEach(async () => {
                await noteForm.openDropdownAndClickCloseButton();
              });

              it('should display navigation modal', function () {
                expect(noteForm.navigationModalIsOpened).to.be.true;
              });

              describe('and cancel navigation button was clicked', () => {
                beforeEach(async () => {
                  await noteForm.clickCancelNavigationButton();
                });

                it('should close navigation modal', () => {
                  expect(noteForm.navigationModalIsOpened).to.be.false;
                });

                it('should keep the user on the same page', function () {
                  expect(this.location.pathname + this.location.search).to.equal(`/users/notes/${userNote.id}/edit`);
                });
              });

              describe('and continue navigation button was clicked', () => {
                beforeEach(async () => {
                  await noteForm.clickContinueNavigationButton();
                });

                it('should close navigation modal', () => {
                  expect(noteForm.navigationModalIsOpened).to.be.false;
                });

                it('should redirect to previous page', function () {
                  expect(this.location.pathname + this.location.search).to.equal(`/users/notes/${userNote.id}`);
                });
              });
            });

            describe('and save button was clicked', () => {
              beforeEach(async () => {
                await noteForm.saveButton.click();
              });

              it('should redirect to previous page', function () {
                expect(this.location.pathname + this.location.search).to.equal(`/users/notes/${userNote.id}`);
              });
            });
          });
        });
      });
    });
  });
});
