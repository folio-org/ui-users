import { screen, fireEvent } from '@testing-library/react';
import '__mock__/stripesCore.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import PermissionsList from './PermissionsList';


jest.unmock('@folio/stripes/components');

const renderPermissionsList = (props) => renderWithRouter(<PermissionsList {...props} />);

const props = {
  assignedPermissionIds: ['822d0819-454c-4310-a341-9bd1d404a95f'],
  filteredPermissions: [
    {
      'permissionName' : 'acq-admin',
      'displayName' : 'acq-admin',
      'id' : '822d0819-454c-4310-a341-9bd1d404a95f',
      'description' : 'Entire set of permissions needed to view requests',
      'tags' : [],
      'subPermissions' : [],
      'childOf' : [],
      'grantedTo' : ['2566b238-e0e6-48b0-a21c-5be03500d726', 'fb1ea30c-e94e-41f0-84f4-2e7ddf65c77a'],
      'mutable' : false,
      'visible' : true,
      'dummy' : false,
      'deprecated' : false,
      'moduleName' : 'folio_checkout',
      'moduleVersion' : '7.0.1000575',
    },
    {
      'permissionName' : 'ui-checkout.viewRequests',
      'displayName' : 'cq-ad',
      'id' : '607d641c-b67f-42a9-aee3-c440616133fa',
      'description' : 'Entire set of permissions needed to view requests',
      'tags' : [],
      'subPermissions' : [],
      'childOf' : [],
      'grantedTo' : ['fb1ea30c-e94e-41f0-84f4-2e7ddf65c77a'],
      'mutable' : false,
      'visible' : true,
      'dummy' : false,
      'deprecated' : false,
      'moduleName' : 'folio_checkout',
      'moduleVersion' : '7.0.1000575'
    }
  ],
  intl: {},
  setAssignedPermissionIds: jest.fn(),
  togglePermission: jest.fn(),
  visibleColumns: ['selected', 'permissionName', 'type', 'status']
};

describe('PermissionsList component', () => {
  it('Checking select all permission name', () => {
    renderPermissionsList(props);
    fireEvent.click(document.querySelector('[data-permission-name="select-all"]'));
    fireEvent.click(document.querySelector('[data-permission-name="select-all"]'));
    expect(renderPermissionsList(props)).toBeTruthy();
  });
  it('checking sort by permission name', () => {
    renderPermissionsList(props);
    fireEvent.click(document.querySelector('[id="clickable-list-column-permissionname"]'));
    fireEvent.click(document.querySelector('[id="clickable-list-column-permissionname"]'));
    expect(renderPermissionsList(props)).toBeTruthy();
  });
  it('checking sort order for status', () => {
    renderPermissionsList(props);
    fireEvent.click(document.querySelector('[id="clickable-list-column-status"]'));
    fireEvent.click(document.querySelector('[id="clickable-list-column-status"]'));
    expect(renderPermissionsList(props)).toBeTruthy();
  });
  it('checking sort order for type', () => {
    renderPermissionsList(props);
    fireEvent.click(document.querySelector('[id="clickable-list-column-type"]'));
    fireEvent.click(document.querySelector('[id="clickable-list-column-type"]'));
    expect(renderPermissionsList(props)).toBeTruthy();
  });
  it('checking each permission click status', () => {
    renderPermissionsList(props);
    fireEvent.click(document.querySelector('[data-permission-name="acq-admin"]'));
    fireEvent.click(screen.getByText('ui-checkout.permission.viewRequests'));
    expect(renderPermissionsList(props)).toBeTruthy();
  });
});
