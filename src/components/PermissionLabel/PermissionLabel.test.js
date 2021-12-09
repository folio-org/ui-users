import { screen } from '@testing-library/react';
import '__mock__/stripesCore.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import PermissionLabel from './PermissionLabel';


jest.unmock('@folio/stripes/components');

const renderPermissionLabel = (props) => renderWithRouter(<PermissionLabel {...props} />);

describe('PermissionLabel component', () => {
  it('Must display raw permission data', () => {
    const props = {
      permission: {
        permissionName: 'circ-observer',
        deprecated: false,
        displayName: 'circ-observer',
        dummy: false,
      },
      formatMessage: jest.fn(),
      showRaw: true
    };
    renderPermissionLabel(props);
    expect(screen.getByText('circ-observer (circ-observer.permission.)')).toBeTruthy();
  });
  it('must display the permission data', () => {
    const props = {
      permission: {
        permissionName: 'circ-observer',
        deprecated: false,
        displayName: 'circ-observer',
        dummy: false,
      },
      formatMessage: jest.fn(),
      showRaw: false
    };
    renderPermissionLabel(props);
    expect(screen.getByText('circ-observer.permission.')).toBeTruthy();
  });
});
