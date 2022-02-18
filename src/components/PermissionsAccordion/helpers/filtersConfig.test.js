import { describe, expect, test } from '@jest/globals';

import { permissionTypeFilterConfig, statusFilterConfig } from './filtersConfig';

const permissions = [
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
    'mutable' : true,
    'visible' : true,
    'dummy' : false,
    'deprecated' : false,
    'moduleName' : 'folio_checkout',
    'moduleVersion' : '7.0.1000575'
  },
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
const assignedPermissions = [
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
const assignedPermissionId = assignedPermissions.map(({ id }) => id);

describe('Testing permissionTypeFilterConfig const', () => {
  test('Returns correct filters when called', () => {
    expect(permissionTypeFilterConfig).toEqual(expect.objectContaining({
      label: expect.anything(),
      cql: expect.any(String),
      name: expect.any(String),
      values: expect.anything(),
      filter: expect.anything(),
    }));
    const filters = { 'permissionType.permissionSets': true };
    expect(permissionTypeFilterConfig.filter(permissions, filters)).toBeDefined();
  });
  test('Check if filters are working', () => {
    const filters = { 'permissionType.permissionSets': false };
    expect(permissionTypeFilterConfig.filter(permissions, filters)).toBeTruthy();
  });
  test('Checking multiple filters', () => {
    expect(permissionTypeFilterConfig).toBeDefined();
    const filters = { 'permissionType.permissionSets': false,
      'permissionType.permissions': false };
    expect(permissionTypeFilterConfig.filter(permissions, filters)).toBeTruthy();
  });
});

describe('Testing statusFilterConfig const', () => {
  test('Returns correct filters when called', () => {
    expect(statusFilterConfig).toEqual(expect.objectContaining({
      label: expect.anything(),
      cql: expect.any(String),
      name: expect.any(String),
      values: expect.anything(),
      filter: expect.anything(),
    }));
    const filters = { 'status.assigned': false };
    expect(statusFilterConfig.filter(permissions, filters, assignedPermissionId)).toBeDefined();
  });
  test('Check if filters are working', () => {
    const filters = { 'status.assigned': true,
      'status.unassigned': false };
    expect(statusFilterConfig.filter(permissions, filters, assignedPermissionId)).toBeTruthy();
  });
  test('Checking multiple filters', () => {
    const filters = { 'status.assigned': true,
      'status.unassigned': true };
    expect(statusFilterConfig.filter(permissions, filters, [])).toBeTruthy();
  });
});
