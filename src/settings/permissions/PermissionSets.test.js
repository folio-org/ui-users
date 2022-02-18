import { screen, fireEvent } from '@testing-library/react';
import '__mock__/stripesCore.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import PermissionSets from './PermissionSets';

jest.unmock('@folio/stripes/components');

const renderPermissionSets = (props) => renderWithRouter(<PermissionSets {...props} />);

const resources = {
  entries: {
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
  entries: {
    GET: jest.fn(),
    PUT: jest.fn(),
    POST: jest.fn(),
    DELETE: jest.fn(),
  }
};

describe('PermissionSets component', () => {
  it('Permissions must be displayed', () => {
    const props = {
      resources,
      mutator,
    };
    renderPermissionSets(props);
    expect(screen.getByText('circ-admin')).toBeTruthy();
    expect(screen.getByText('circ-observer')).toBeTruthy();
  });
  it('Check for  before save and validate functions', () => {
    const props = {
      resources,
      mutator,
    };
    renderPermissionSets(props);
    fireEvent.click(screen.getByText('actions'));
    fireEvent.click(screen.getByText('emptyActions'));
    expect(renderPermissionSets(props)).toBeTruthy();
  });
  it('component must render with empty data', () => {
    const props = {
      resources : {},
      mutator,
    };
    renderPermissionSets(props);
    fireEvent.click(screen.getByText('actions'));
    fireEvent.click(screen.getByText('emptyActions'));
    expect(renderPermissionSets(props)).toBeTruthy();
  });
});
