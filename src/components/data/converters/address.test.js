import { describe, expect, test } from '@jest/globals';
import { getFormAddressList, toUserAddresses } from './address';

describe('getFormAddressList', () => {
  test('returns nothing when given nothing', () => {
    expect(getFormAddressList()).toBeUndefined();
  });

  test('returns an empty array when given an empty array', () => {
    expect(getFormAddressList([])).toEqual([]);
  });

  test('maps object fields correctly when they lack "id" property', () => {
    const expected = [
      {
        addressLine1: 'a.al1',
        addressLine2: 'a.al2',
        city: 'a.city',
        primaryAddress: 2,
        primary: 2,
        stateRegion: 'a.region',
        zipCode: 'a.postalCode',
        addressType: 'a.addressTypeId',
        country: 'a.countryId',
      },
      {
        addressLine1: 'b.al1',
        addressLine2: 'b.al2',
        city: 'b.city',
        primaryAddress: 1,
        primary: 1,
        stateRegion: 'b.region',
        zipCode: 'b.postalCode',
        addressType: 'b.addressTypeId',
        country: '',
      }
    ];
    const addresses = [
      {
        addressLine1: 'a.al1',
        addressLine2: 'a.al2',
        city: 'a.city',
        primaryAddress: 2,
        region: 'a.region',
        postalCode: 'a.postalCode',
        addressTypeId: 'a.addressTypeId',
        countryId: 'a.countryId',
      },
      {
        addressLine1: 'b.al1',
        addressLine2: 'b.al2',
        city: 'b.city',
        primaryAddress: 1,
        region: 'b.region',
        postalCode: 'b.postalCode',
        addressTypeId: 'b.addressTypeId',
      },
    ];

    const results = getFormAddressList(addresses);

    expect(results[0]).toMatchObject(expected[0]);
    expect(results[1]).toMatchObject(expected[1]);
  });


  test('returns objects as-is if they contain "id" property', () => {
    const expected = [
      {
        addressLine1: 'a.al1',
        addressLine2: 'a.al2',
        postalCode: 'a.postalCode',
        id: 'a.id',
      },
      {
        addressLine1: 'b.al1',
        addressLine2: 'b.al2',
        postalCode: 'b.postalCode',
        id: 'b.id',
      }
    ];
    const addresses = [
      {
        addressLine1: 'a.al1',
        addressLine2: 'a.al2',
        postalCode: 'a.postalCode',
        id: 'a.id',
      },
      {
        addressLine1: 'b.al1',
        addressLine2: 'b.al2',
        postalCode: 'b.postalCode',
        id: 'b.id',
      },
    ];

    const results = getFormAddressList(addresses);

    expect(results[0]).toMatchObject(expected[0]);
    expect(results[1]).toMatchObject(expected[1]);
  });
});

describe('toUserAddresses', () => {
  test('returns undefined when given empty array', () => {
    expect(toUserAddresses([])).toBeUndefined();
  });

  test('maps fields correctly', () => {
    const expected = [
      {
        addressLine1: 'al1',
        addressLine2: 'al2',
        city: 'city',
        primaryAddress: 'primary',
        region: 'region',
        postalCode: 'postalCode',
        addressTypeId: 'addressTypeId',
        countryId: 'countryId',
      }
    ];
    const addresses = [
      {
        addressLine1: 'al1',
        addressLine2: 'al2',
        city: 'city',
        primaryAddress: 'primary',
        stateRegion: 'region',
        zipCode: 'postalCode',
        addressType: 'addressTypeId',
        country: 'countryId',
      }
    ];

    expect(toUserAddresses(addresses)).toEqual(expected);
  });
});
