import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import UserFormPage from '../interactors/user-form-page';

describe('Service points modal', () => {
  setupApplication({
    interfaces: {
      'service-points-users': '1.0',
    }
  });

  describe('visit user edit page', () => {
    beforeEach(async function () {
      const user = this.server.create('user');
      const sp = this.server.create('service-point');
      this.server.create('service-point');
      this.server.create('service-points-user', {
        userId: user.id,
        servicePointsIds: [sp.id],
      });
      this.visit(`/users/${user.id}/edit`);
      await UserFormPage.whenLoaded();
    });

    describe('when expanding the service points accordion', () => {
      beforeEach(async () => {
        await UserFormPage.toggleSPAccordionButton.click();
      });

      it('1 service point should be displayed', () => {
        expect(UserFormPage.servicePoints().length).to.equal(1);
      });

      it('add service points button should be present', () => {
        expect(UserFormPage.addServicePointButton.isPresent).to.be.true;
      });

      describe('clicking the add service points button', () => {
        beforeEach(async function () {
          await UserFormPage.addServicePointButton.click();
        });

        it('service point modal should be present', () => {
          expect(UserFormPage.servicePointsModal.isPresent).to.be.true;
        });

        it('1 service point should be checked', () => {
          expect(UserFormPage.servicePointsModal.checkBoxes(0).isChecked).to.be.false;
          expect(UserFormPage.servicePointsModal.checkBoxes(1).isChecked).to.be.true;
          expect(UserFormPage.servicePointsModal.checkBoxes(2).isChecked).to.be.false;
        });

        describe('when adding all service points', () => {
          beforeEach(async function () {
            await UserFormPage.servicePointsModal.checkBoxes(0).clickInput();
            await UserFormPage.servicePointsModal.saveButton.click();
          });

          it('2 service points should be displayed', () => {
            expect(UserFormPage.servicePoints().length).to.equal(2);
          });

          describe('when unchecking all service points', () => {
            beforeEach(async function () {
              await UserFormPage.addServicePointButton.click();
              await UserFormPage.servicePointsModal.checkBoxes(1).clickInput();
              await UserFormPage.servicePointsModal.checkBoxes(2).clickInput();
              await UserFormPage.servicePointsModal.saveButton.click();
            });

            it('service points should not be displayed', () => {
              expect(UserFormPage.servicePoints().length).to.equal(0);
            });
          });

          describe('when deleting all service points', () => {
            beforeEach(async function () {
              await UserFormPage.servicePoints(1).deleteServicePoint();
              await UserFormPage.servicePoints(0).deleteServicePoint();
            });

            it('service points should not be displayed', () => {
              expect(UserFormPage.servicePoints().length).to.equal(0);
            });

            describe('when opening service points modal', () => {
              beforeEach(async function () {
                await UserFormPage.addServicePointButton.click();
              });

              it('service points should not be checked', () => {
                expect(UserFormPage.servicePointsModal.checkBoxes(0).isChecked).to.be.false;
                expect(UserFormPage.servicePointsModal.checkBoxes(1).isChecked).to.be.false;
                expect(UserFormPage.servicePointsModal.checkBoxes(2).isChecked).to.be.false;
              });
            });
          });
        });
      });
    });
  });
});
