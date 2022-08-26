import { getInitialFiltersState } from './index';

const filters = [
  {
    cql: 'permissionType',
    label: <div>Label</div>,
    name: 'permissionType',
    values: [
      {
        cql: 'permissionSets',
        displayName: <div>Permissionsets</div>,
        name: 'permissionSets',
        value: true,
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
    label: <div>status</div>,
    name: 'status',
    values: [
      {
        cql: 'assigned',
        displayName: <div>assigned</div>,
        name: 'assigned',
        value: true,
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

const filterss = [
  {
    cql: 'permissionType',
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
        value: true,
      },
    ],
  },
  {
    cql: 'status',
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
        value: true,
      },
    ],
  },
];

describe('getInitialFiltersState component', () => {
  it('for assigned value', () => {
    const data = getInitialFiltersState(filters);
    expect(data).toStrictEqual({ 'permissionType.permissionSets': true, 'status.assigned': true });
  });
  it('for unassigned value', () => {
    const data = getInitialFiltersState(filterss);
    expect(data).toStrictEqual({ 'permissionType.permissions': true, 'status.unassigned': true });
  });
});
