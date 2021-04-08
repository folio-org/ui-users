import { describe, expect, test } from '@jest/globals';

import { getPermissionLabelString } from './permission';

describe('getPermissionLabelString', () => {
  test('uses displayName when available', () => {
    const expected = 'chicken';
    const f = jest.fn(props => props.defaultMessage);
    const p = {
      permissionName: 'permission.funky',
      displayName: 'chicken',
    };

    expect(getPermissionLabelString(p, f)).toEqual(expected);
  });

  test('uses permissionName when displayName is not available', () => {
    const expected = 'permission.funky';
    const f = jest.fn(props => props.defaultMessage);
    const p = {
      permissionName: 'permission.funky',
    };

    expect(getPermissionLabelString(p, f)).toEqual(expected);
  });

  test('shows permissionName and displayName when given "showRaw"', () => {
    const expected = 'permission.funky (chicken)';
    const f = jest.fn(props => props.defaultMessage);
    const p = {
      permissionName: 'permission.funky',
      displayName: 'chicken',
    };

    expect(getPermissionLabelString(p, f, true)).toEqual(expected);
  });
});
