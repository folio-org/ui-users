import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';

import ManualBlockTemplatesForm from '../interactors/manual-block-templates-form';

describe('Manual block templates edit page', () => {
  setupApplication({ scenarios: ['manual-block-templates'] });

  const templatesFormInteractor = new ManualBlockTemplatesForm();

  let blockTemplate;
  beforeEach(async function () {
    blockTemplate = this.server.create('manual-block-template');
    this.visit(
      `settings/users/manual-block-templates/${blockTemplate.id}?layer=edit`
    );
    await templatesFormInteractor.whenLoaded();
  });

  it('should display the title in the pane header', () => {
    expect(templatesFormInteractor.title).to.equal(
      `Edit: ${blockTemplate.name}`
    );
  });

  describe('clicking delete template', () => {
    beforeEach(async function () {
      await templatesFormInteractor.clickDelete();
    });
    it('should display confirm delete udp', () => {
      expect(templatesFormInteractor.deleteConfirmation).to.exist;
    });

    describe('clicking cancel delete', () => {
      beforeEach(async function () {
        await templatesFormInteractor.deleteConfirmation.clickCancel();
      });
      it('should display edit view again', () => {
        expect(templatesFormInteractor.title).to.equal(
          `Edit: ${blockTemplate.name}`
        );
      });
    });
  });
});
