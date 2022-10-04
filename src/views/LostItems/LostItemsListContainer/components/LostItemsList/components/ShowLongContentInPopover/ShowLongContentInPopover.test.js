import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import ShowLongContentInPopover, {
  getComponentText,
} from './ShowLongContentInPopover';

const shortText = 'In publishing and graphic design';
const longText = 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content.';
const testIds = {
  longContentInPopover: 'longContentInPopover',
  infoPopover: 'infoPopover',
};

describe('getComponentText', () => {
  describe('with default contentLength', () => {
    it('should return contentText with popoverText', () => {
      expect(getComponentText(longText)).toEqual({
        contentText: 'In publishing and graphic design, Lorem ipsum is a placeholder text',
        popoverText: longText,
      });
    });

    it('should return cropped contentText with popoverText', () => {
      const withoutSpace = 'Inpublishingandgraphicdesign,Loremipsumisaplaceholdertextcommonlyusedtodemonstratethevisualformofadocumentoratypefacewithoutrelyingonmeaningfulcontent.';

      expect(getComponentText(withoutSpace)).toEqual({
        contentText: 'Inpublishingandgraphicdesign,Loremipsumisaplaceholdertextcommonlyusedtodemo',
        popoverText: withoutSpace,
      });
    });


    it('should return contentText without popoverText', () => {
      expect(getComponentText(shortText)).toEqual({
        contentText: shortText,
        popoverText: '',
      });
    });
  });

  describe('without default contentLength', () => {
    it('should return contentText with popoverText', () => {
      const contentLength = 50;

      expect(getComponentText(longText, contentLength)).toEqual({
        contentText: 'In publishing and graphic design, Lorem ipsum is a',
        popoverText: longText,
      });
    });

    it('should return contentText without popoverText', () => {
      const contentLength = 50;

      expect(getComponentText(shortText, contentLength)).toEqual({
        contentText: shortText,
        popoverText: '',
      });
    });
  });
});

describe('ShowLongContentInPopover', () => {
  describe('with InfoPopover', () => {
    beforeEach(() => {
      render(
        <ShowLongContentInPopover text={longText} />
      );
    });

    it('should render ShowLongContentInPopover', () => {
      expect(screen.getByTestId(testIds.longContentInPopover)).toBeInTheDocument();
    });

    it('should render InfoPopover', () => {
      expect(screen.getByTestId(testIds.infoPopover)).toBeInTheDocument();
    });
  });

  describe('without InfoPopover', () => {
    beforeEach(() => {
      render(
        <ShowLongContentInPopover text={shortText} />
      );
    });

    it('should render ShowLongContentInPopover', () => {
      expect(screen.getByTestId(testIds.longContentInPopover)).toBeInTheDocument();
    });

    it('should not render InfoPopover', () => {
      expect(screen.queryByTestId(testIds.infoPopover)).not.toBeInTheDocument();
    });
  });
});
