import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import InstanceDetails, {
    getISBN,
    getEffectiveCallNumber,
} from './InstanceDetails';
import { ISBN_ID } from '../../../../../constants';

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
