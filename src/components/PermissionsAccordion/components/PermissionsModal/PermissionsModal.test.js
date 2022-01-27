import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

import PermissionsModal from './PermissionsModal';

jest.unmock('@folio/stripes/components');

const record = [
  {
    'permissionName' : 'ui-agreements.resources.edit',
    'displayName' : 'Agreements: Edit e-resources',
    'id' : 'e103449a-952d-42a1-938b-52f49db7bda1',
    'description' : 'Grants all permissions included in Agreements: Search & view e-resources plus the ability to edit the e-resources',
    'tags' : [],
    'subPermissions' : ['erm.pci.edit', 'erm.pti.edit', 'erm.titles.edit', 'ui-agreements.resources.view'],
    'childOf' : [],
    'grantedTo' : ['fb1ea30c-e94e-41f0-84f4-2e7ddf65c77a'],
    'mutable' : false,
    'visible' : true,
    'dummy' : false,
    'deprecated' : false,
    'moduleName' : 'folio_agreements',
    'moduleVersion' : '8.0.1000774'
  }, {
    'permissionName' : 'ui-checkout.viewFeeFines',
    'displayName' : 'Check out: View fees/fines',
    'id' : '87a3f1b3-1e0a-4a4e-84de-31d417398257',
    'description' : 'Entire set of permissions needed to view fees/fines',
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
  }, {
    'permissionName' : 'ui-checkout.viewRequests',
    'displayName' : '',
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
  },
];

const resources = {
  availablePermissions: {
    url: 'https://folio-testing-okapi.dev.folio.org/perms/permissions?length=10000&query=(visible==true)',
    hasLoaded: true,
    failedMutations: [],
    records: record,
    resource: 'availablePermissions',
    successfulMutations: [],
    throwErrors: true,
    httpStatus: 200,
    module: '@folio/users',
    other: {
      totalrecords: 3,
    },
  },
};

const resourcesNull = {
  availablePermissions: {
    url: 'https://folio-testing-okapi.dev.folio.org/perms/permissions?length=10000&query=(visible==true)',
    hasLoaded: true,
    failedMutations: [],
    resource: 'availablePermissions',
    successfulMutations: [],
    throwErrors: true,
    httpStatus: 200,
    module: '@folio/users',
    other: {
      totalrecords: 3,
    },
  },
};

const mutator = {
  availablePermissions: {
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
    reset: jest.fn(),
    GET:  () => new Promise((resolve, _) => {
      const response = record;
      resolve(response);
    }),
  },
};

const filtersConfig = [
  {
    cql: 'permissionType',
    filter: jest.fn((permissions) => {
      return permissions;
    }),
    label: <div>Label</div>,
    name: 'permissionType',
    values: [
      {
        cql: 'permissionSets',
        displayName: <div>Permissionsets</div>,
        name: 'permissionSets',
        value: false,
      },
      {
        cql: 'permissions',
        displayName: <div>permissionsss</div>,
        name: 'permissions',
        value: false,
      },
    ],
  },
  {
    cql: 'status',
    filter: jest.fn((permissions) => {
      return permissions;
    }),
    label: <div>status</div>,
    name: 'status',
    values: [
      {
        cql: 'assigned',
        displayName: <div>assigned</div>,
        name: 'assigned',
        value: false,
      },
      {
        cql: 'unassigned',
        displayName: <div>unassigned</div>,
        name: 'unassigned',
        value: false,
      },
    ],
  },
];

const assignedPermissionsData = [
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
  }
];

const renderPermissionsModal = (props) => render(<PermissionsModal {...props} />);

describe('PermissionsModal', () => {
  it('Component should render', async () => {
    const props = {
      resources,
      addPermissions: jest.fn(),
      assignedPermissions: assignedPermissionsData,
      visibleColumns: ['selected', 'permissionName', 'type', 'status'],
      filtersConfig,
      onClose: jest.fn(),
      refreshRemote: jest.fn(),
      mutator,
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
      open: true,
    };
    await expect(renderPermissionsModal(props)).toBeDefined();
    expect.assertions(2);
    expect(screen.getAllByText('ui-users.permissions.modal.list.pane.header')).toBeDefined();
  });

  it('Searching Text', async () => {
    const props = {
      resources,
      addPermissions: jest.fn(),
      assignedPermissions: assignedPermissionsData,
      visibleColumns: ['selected', 'permissionName', 'type', 'status'],
      filtersConfig,
      onClose: jest.fn(),
      refreshRemote: jest.fn(),
      mutator,
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
        translations: {},
      },
      open: true,
    };
    await expect(renderPermissionsModal(props)).toBeDefined();
    fireEvent.change(document.querySelector('[data-test-search-field="true"]'), { target : { value: 'Permissions' } });
    fireEvent.click(screen.getByText('ui-users.search'));
    expect(screen.getAllByText('stripes-components.tableEmpty')).toBeDefined();
  });

  it('Toggle Filter Pane', async () => {
    const props = {
      resources,
      addPermissions: jest.fn(),
      assignedPermissions: assignedPermissionsData,
      visibleColumns: ['selected', 'permissionName', 'type', 'status'],
      filtersConfig,
      onClose: jest.fn(),
      refreshRemote: jest.fn(),
      mutator,
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
      open: true,
    };
    await expect(renderPermissionsModal(props)).toBeDefined();
    fireEvent.click(document.querySelector('[aria-labelledby="collapse-filter-pane-button-tooltip-text"]'));
    expect(document.querySelector('[aria-label="caret-right"]')).toBeDefined();
  });

  it('Search Form functions', async () => {
    const props = {
      resources,
      addPermissions: jest.fn(),
      assignedPermissions: assignedPermissionsData,
      visibleColumns: ['selected', 'permissionName', 'type', 'status'],
      filtersConfig,
      onClose: jest.fn(),
      refreshRemote: jest.fn(),
      mutator,
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
      open: true,
    };
    await expect(renderPermissionsModal(props)).toBeDefined();

    // screen.debug(document.querySelector('[data-test-filter-groups="true"]'));
    fireEvent.click(screen.getByText('Permissionsets'));

    // for else condition
    fireEvent.click(screen.getByText('Permissionsets'));

    // reset form button check
    fireEvent.click(document.querySelector('[data-test-reset-all-button="true"]'));

    // clear filters Button check
    fireEvent.click(screen.getByText('Permissionsets'));
    fireEvent.click(document.querySelector('[data-test-clear-button="true"]'));

    fireEvent.click(screen.getByText('permissionsss'));

    fireEvent.click(screen.getByText('assigned'));
    fireEvent.click(document.querySelector('[data-test-clear-button="true"]'));
  });

  it('Save and toggle Permissions', async () => {
    const props = {
      resources,
      addPermissions: jest.fn(),
      assignedPermissions: assignedPermissionsData,
      visibleColumns: ['selected', 'permissionName', 'type', 'status'],
      filtersConfig,
      onClose: jest.fn(),
      refreshRemote: jest.fn(),
      mutator,
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
      open: true,
    };
    expect.assertions(1);
    await waitFor(() => expect(renderPermissionsModal(props)).toBeDefined());
    // add permission
    fireEvent.click(document.querySelector('[data-permission-name="ui-agreements.resources.edit"]'));

    // save
    fireEvent.click(screen.getByText('ui-users.saveAndClose'));

    // removes permission if clicked twice
    fireEvent.click(document.querySelector('[data-permission-name="ui-agreements.resources.edit"]'));

    // select all permission
    fireEvent.click(document.querySelector('[data-permission-name="select-all"]'));
  });

  it('Save and toggle Permissions', async () => {
    const props = {
      resources: resourcesNull,
      addPermissions: jest.fn(),
      assignedPermissions: assignedPermissionsData,
      visibleColumns: ['selected', 'permissionName', 'type', 'status'],
      filtersConfig,
      onClose: jest.fn(),
      refreshRemote: jest.fn(),
      mutator,
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
      open: true,
    };
    expect.assertions(1);
    await waitFor(() => expect(renderPermissionsModal(props)).toBeDefined());
    fireEvent.change(document.querySelector('[data-test-search-field="true"]'), { target : { value: 'Search' } });
    fireEvent.click(screen.getByText('ui-users.search'));
  });

  it('Saves invisible permissions', async () => {
    const initialPerms = [
      {
        'permissionName' : 'ui-mystery.invisible',
        'displayName' : '',
        'id' : '607d641c-b67f-42a9-aee3-c44061613300',
        'description' : 'Hi, this is an invisible permission!',
        'visible' : false,
        'subPermissions' : [],
        'dummy' : false,
        'mutable' : false,
      }
    ];
    const props = {
      resources: resourcesNull,
      addPermissions: jest.fn(perms => perms.length),
      assignedPermissions: initialPerms,
      visibleColumns: ['selected', 'permissionName', 'type', 'status'],
      filtersConfig,
      onClose: jest.fn(),
      refreshRemote: jest.fn(),
      mutator,
      okapi: {
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        okapiReady: true,
        authFailure: [],
        bindings: {},
      },
      open: true,
    };
    const beforeCount = initialPerms.length;

    expect.assertions(2);
    await waitFor(() => expect(renderPermissionsModal(props)).toBeDefined());
    fireEvent.click(screen.getByText('ui-users.saveAndClose'));
    // Previously, saving a new set of permissions via the modal would delete
    // any invisible permissions that were assigned. Thus, we should have the
    // same number of (invisible) perms that we started with.
    expect(props.addPermissions).toHaveLastReturnedWith(beforeCount);
  });
});
