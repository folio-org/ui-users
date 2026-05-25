import React from 'react';

jest.mock('@folio/stripes/util', () => ({
  ...jest.requireActual('@folio/stripes/util'),
  getSourceSuppressor: jest.fn(() => () => false),
  getHeaderWithCredentials: jest.fn(() => ({
    headers: {}
  })),
  getFullName: jest.fn(),
}));
