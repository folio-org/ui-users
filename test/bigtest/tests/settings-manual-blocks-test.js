import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';

import ManualBlockTemplates from '../interactors/manual-block-templates';

describe('Test settings manual block templates', () => {
  setupApplication({ scenarios: ['manual-block-templates'] });

  const blockTemplatesInteractor = new ManualBlockTemplates();

  describe('visit manual block templates settings page', () => {
    beforeEach(async function () {
      this.server.createList('manual-block-template', 3);
      this.visit('settings/users/manual-block-templates');
      await blockTemplatesInteractor.whenLoaded();
    });

    it('shows the list of manual block templates', () => {
      expect(blockTemplatesInteractor.isVisible).to.equal(true);
    });

    it('renders each instance', () => {
      expect(blockTemplatesInteractor.instances().length).to.be.equal(3);
    });
  });

  describe('visit manual block templates details page', () => {
    let blockTemplates;
    beforeEach(async function () {
      blockTemplates = await this.server.createList('manual-block-template', 3);
      this.visit(`settings/users/manual-block-templates/${blockTemplates[0].id}`);
      await blockTemplatesInteractor.templateDetails.whenLoaded();
    });

    it('has correct title', () => {
      expect(blockTemplatesInteractor.templateDetails.instance.isVisible).to.equal(true);
    });
  });

});
