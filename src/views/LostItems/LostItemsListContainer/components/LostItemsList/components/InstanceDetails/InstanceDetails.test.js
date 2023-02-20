import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import { effectiveCallNumber } from '@folio/stripes/util';

import InstanceDetails, {
  getISBN,
  renderISBN,
  getEffectiveCallNumber,
} from './InstanceDetails';
import ShowLongContentInPopover from './components';
import { ISBN_ID } from '../../../../../constants';

jest.mock('@folio/stripes/util', () => ({
  effectiveCallNumber: jest.fn(),
}));
jest.mock('./components', () => jest.fn(() => null));

describe('InstanceDetails', () => {
  describe('getISBN', () => {
    const notISBNIdentifier = {
      identifierTypeId: 'not_ISBN_ID',
      identifierType: 'identifierTypeForISBN',
      value: 'valueForISBN',
    };
    const ISBNIdentifier = {
      identifierTypeId: ISBN_ID,
      identifierType: 'identifierTypeForISBN',
      value: 'valueForISBN',
    };

    it('should not return identifier(s) when instanceIdentifiers are absence', () => {
      expect(getISBN({})).toEqual([]);
    });

    it('should not return identifier(s) when identifierTypeId does not match ISBN_ID', () => {
      expect(getISBN({
        instance: {
          identifiers: [notISBNIdentifier],
        },
      })).toEqual([]);
    });

    it('should return identifier(s) when identifierTypeId match ISBN_ID', () => {
      expect(getISBN({
        instance: {
          identifiers: [notISBNIdentifier, ISBNIdentifier],
        },
      })).toEqual([ISBNIdentifier]);
    });
  });

  describe('renderISBN', () => {
    it('should return correct data', () => {
      const actualCostRecord = {
        instance: {
          identifiers: [{
            identifierTypeId: ISBN_ID,
            value: 'value',
          }],
        },
      };
      const result = renderISBN(actualCostRecord);

      render(result);

      expect(screen.getByText(/value/)).toBeInTheDocument();
    });
  });

  describe('getEffectiveCallNumber', () => {
    it('should trigger "effectiveCallNumber" with correct data', () => {
      const actualCostRecord = {
        item: 'item',
      };

      getEffectiveCallNumber(actualCostRecord);

      expect(effectiveCallNumber).toHaveBeenCalledWith(actualCostRecord.item);
    });
  });

  describe('InstanceDetails component', () => {
    const actualCostRecord = {
      instance: {
        title: 'title',
      },
      item: {
        materialType: 'materialType',
        loanType: 'loanType',
      },
    };

    beforeEach(() => {
      render(
        <InstanceDetails
          actualCostRecord={actualCostRecord}
        />
      );
    });

    it('should render "ShowLongContentInPopover" with correct props', () => {
      const expectedProps = {
        text: actualCostRecord.instance.title,
        additionalText: actualCostRecord.item.materialType,
      };

      expect(ShowLongContentInPopover).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render loan type information', () => {
      expect(screen.getByText(/loanType/)).toBeInTheDocument();
    });
  });
});
