import { describe, expect, test } from '@jest/globals';

import { toAddressTypeOptions } from './address_type';

describe('toAddressTypeOptions', () => {
  test('handles empty input', () => {
    const expected = [];
    expect(toAddressTypeOptions()).toEqual(expected);
  });

  test('handles non-empty input', () => {
    const at = [
      { addressType: 'a', id: 1 },
      { addressType: 'b', id: 2 },
    ];

    const expected = [
      { label: 'a', value: 1 },
      { label: 'b', value: 2 },
    ];
    expect(toAddressTypeOptions(at)).toEqual(expected);
  });
});
