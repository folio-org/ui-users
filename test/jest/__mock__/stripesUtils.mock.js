import React from 'react';

jest.mock('@folio/stripes/util', () => ({
  exportCsv: jest.fn(),
  getSourceSuppressor: jest.fn(() => () => false),
  getHeaderWithCredentials: jest.fn(() => ({
      headers: {}
  })),
}));
