import React from 'react';
import { screen } from '@testing-library/react';
import renderWithRouter from 'helpers/renderWithRouter';
import '__mock__';
import '__mock__/stripesSmartComponent.mock';
import '__mock__/stripesCore.mock';
import userEvent from '@testing-library/user-event';
import BlockTemplates from './BlockTemplates';

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
  it('Permissions must be displayed', async () => {
    const props = {
      resources,
      mutator,
      intl: {},
    };
    renderBlockTemplates(props);
    expect(screen.getByText('circ-admin')).toBeTruthy();
    expect(screen.getByText('circ-observer')).toBeTruthy();
  });
  it('Check for  before save and validate functions', () => {
    const props = {
      resources,
      mutator,
    };
    renderBlockTemplates(props);
    userEvent.click(screen.getByText('actions'));
    userEvent.click(screen.getByText('emptyActions'));
    expect(renderBlockTemplates(props)).toBeTruthy();
  });
  it('component must render with empty data', () => {
    const props = {
      resources : {},
      mutator,
    };
    renderBlockTemplates(props);
    userEvent.click(screen.getByText('actions'));
    userEvent.click(screen.getByText('emptyActions'));
    expect(renderBlockTemplates(props)).toBeTruthy();
  });
});
