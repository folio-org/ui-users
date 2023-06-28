import React from 'react';

import contactTypes from './contactTypes';

describe('contactTypes', () => {
  test('contains 3 types', () => {
    expect(contactTypes.length).toEqual(3);
  });

  test('contains correct ids', () => {
    const ids = ['002', '001', '003'];

    contactTypes.forEach((contactType, index) => {
      expect(contactType.id).toEqual(ids[index]);
    });
  });
});
