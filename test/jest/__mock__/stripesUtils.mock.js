import React from 'react';

jest.mock('@folio/stripes/util', () => ({
  getSourceSuppressor: jest.fn(() => () => false),
  getHeaderWithCredentials: jest.fn(() => ({
    headers: {}
  })),
  getFullName: jest.fn(),
}));
