import React from 'react';
import { screen } from '@folio/jest-config-stripes/testing-library/dom';

import renderWithRouter from 'helpers/renderWithRouter';
import '__mock__';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/stripesCore.mock';
import BlockTemplates, { validate } from './BlockTemplates';

jest.unmock('@folio/stripes/components');

const renderBlockTemplates = (props) => renderWithRouter(
  <BlockTemplates
    {...props}
  />
);

const resources = {
  manualBlockTemplates: {
    resource: 'entries',
    records: [
      {
        permissionName: 'circ-observer',
        deprecated: false,
        displayName: 'circ-observer',
        dummy: false,
        subPermissions: [{ permissionName: 'circ-observer-sub' }]
      },
      {
        permissionName: 'circ-admin',
        deprecated: false,
        displayName: 'circ-admin',
        dummy: false,
      },
    ],
  }
};

const mutator = {
  manualBlockTemplates: {
    GET: jest.fn(),
    PUT: jest.fn(),
    POST: jest.fn(),
    DELETE: jest.fn(),
  }
};

describe('BlockTemplates component', () => {
  it('displays templates', async () => {
    const props = {
      resources,
      mutator,
      intl: {},
    };
    renderBlockTemplates(props);
    expect(screen.getByText('circ-admin')).toBeTruthy();
    expect(screen.getByText('circ-observer')).toBeTruthy();
  });

  it('validate returns an error object on invalid data', () => {
    const errors = validate({});
    expect(Object.keys(errors)).toContain('displayName');
  });

  it('validate returns an empty object on valid data', () => {
    const errors = validate({ name: 'thunder-chicken' });
    expect(typeof errors).toBe('object');
    expect(Object.keys(errors).length).toBe(0);
  });
});
