import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';

import ManualBlockTemplates from '../interactors/manual-block-templates-view';

describe('Manual block templates', () => {
  setupApplication({ scenarios: ['manual-block-templates'] });

  const blockTemplatesInteractor = new ManualBlockTemplates();

  describe('visiting manual block templates settings page', () => {
    beforeEach(async function () {
      this.server.createList('manual-block-template', 3);
      this.visit('settings/users/manual-block-templates');
      await blockTemplatesInteractor.whenLoaded();
    });

    it('should show the list of manual block templates', () => {
      expect(blockTemplatesInteractor.isVisible).to.equal(true);
    });

    it('should render each instance', () => {
      expect(blockTemplatesInteractor.instances().length).to.be.equal(3);
    });
  });

  describe('visiting manual block templates details page', () => {
    let blockTemplates;
    beforeEach(async function () {
      blockTemplates = await this.server.createList('manual-block-template', 3);
      this.visit(
        `settings/users/manual-block-templates/${blockTemplates[0].id}`
      );
      await blockTemplatesInteractor.templateDetails.whenLoaded();
    });

    it('should display detail view', () => {
      expect(
        blockTemplatesInteractor.templateDetails.instance.isVisible
      ).to.equal(true);
    });

    it('should display all accordions', function () {
      expect(
        blockTemplatesInteractor.templateDetails.templateInfoAccordionButton
          .isPresent
      ).to.equal(true);
      expect(
        blockTemplatesInteractor.templateDetails.blockInfoAccordionButton
          .isPresent
      ).to.equal(true);
    });

    it('should display selected block actions correct', function () {
      expect(
        blockTemplatesInteractor.templateDetails.borrowingIcon.class
      ).includes('icon-select-all');
      expect(
        blockTemplatesInteractor.templateDetails.renewalsIcon.class
      ).includes('icon-deselect-all');
      expect(
        blockTemplatesInteractor.templateDetails.requestsIcon.class
      ).includes('icon-select-all');
    });

    describe('closing template info accordion', function () {
      beforeEach(async function () {
        await blockTemplatesInteractor.templateDetails.templateInfoAccordionButton.click();
      });

      it('should collapse template info accordion', () => {
        expect(
          blockTemplatesInteractor.templateDetails.templateInfoAccordionButton
            .expanded
        ).to.equal('false');
        expect(
          blockTemplatesInteractor.templateDetails.blockInfoAccordionButton
            .expanded
        ).to.equal('true');
      });
    });

    describe('closing block info accordion', function () {
      beforeEach(async function () {
        await blockTemplatesInteractor.templateDetails.blockInfoAccordionButton.click();
      });

      it('should collapse template info accordion', () => {
        expect(
          blockTemplatesInteractor.templateDetails.templateInfoAccordionButton
            .expanded
        ).to.equal('true');
        expect(
          blockTemplatesInteractor.templateDetails.blockInfoAccordionButton
            .expanded
        ).to.equal('false');
      });
    });
  });
});
