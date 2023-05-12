import React from 'react';
import userEvent from '@testing-library/user-event';
import renderWithRouter from 'helpers/renderWithRouter';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import UserEdit from './UserEdit';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  LoadingView: () => 'LoadingView',
}));
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  cloneDeep: jest.fn().mockImplementation((user) => {
    return user.id
      ? {}
      : {
        personal: {
          email: 'fgdd@gmail.com',
          addresses: [{ addresseLine1: 'park street' }],
        },
        active: 1,
        permissions: { permissionName: 'test' },
        departments: ['CS'],
        expirationDate: new Date(1, 1, 1),
      };
  }),
  find: jest.fn().mockReturnValue(null),
  get: jest.fn().mockImplementation((resources) => {
    return !!resources.selUser?.records[0]?.check;
  }),
  omit: jest.fn().mockReturnValue({ customFields: { id: false, val: true } }),
}));
jest.mock('./UserForm', () => {
  return function Form({ onSubmit, onCancel }) {
    return (
      <>
        <div>UserForm </div>
        <button type="button" id="clickable-cancel" onClick={onCancel}>
          Cancel Form
        </button>
        <button type="button" id="clickable-save" onClick={onSubmit}>
          Submit Form
        </button>
      </>
    );
  };
});
jest.mock('@folio/stripes/smart-components', () => ({
  EditCustomFieldsRecord: () => 'EditCustomField',
}));
jest.mock('./UserEditHelpers', () => ({
  ...jest.requireActual('./UserEditHelpers'),
  showErrorCallout: jest.fn(),
}));
jest.mock('../../components/EditSections', () => ({
  EditUserInfo: jest.fn(() => null),
  EditExtendedInfo: jest.fn(() => null),
  EditContactInfo: jest.fn(() => null),
  EditProxy: jest.fn(() => null),
  EditServicePoints: jest.fn(() => null),
}));
const mockStore = createMockStore();
const store = mockStore({});
//const user = userEvent.setup();
describe('UserEdit', () => {
  let props = {
    stripes: { hasPerm: jest.fn().mockReturnValue(true) },
    resources: {},
    history: {
      push: jest.fn(),
    },
    location: {},
    match: { params: { id: 1 } },
    updateProxies: jest.fn(),
    updateSponsors: jest.fn(),
    updateServicePoints: jest.fn(),
    getUserServicePoints: jest.fn(),
    getPreferredServicePoint: jest.fn(),
    mutator: {
      records: {
        POST: jest
          .fn()
          .mockResolvedValue(jest.fn().mockResolvedValue({ result: [] })),
      },
      perms: {
        POST: jest.fn().mockResolvedValue({ data: {} }),
      },
      permissions: {
        POST: jest.fn().mockResolvedValue({ data: {} }),
        PUT: jest.fn().mockResolvedValue({ data: {} }),
      },
      requestPreferences: {
        POST: jest.fn().mockResolvedValue({ data: {} }),
        PUT: jest.fn().mockResolvedValue({ data: {} }),
      },
      selUser: {
        PUT: jest.fn().mockResolvedValue({ data: {} }),
      },
      permUserId: '2',
    },
    getProxies: jest.fn(),
    getSponsors: jest.fn(),
  };

  it('should render without crashing', () => {
    const { container } = renderWithRouter(<UserEdit {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing helpers', () => {
    jest.mock('./UserEditHelpers', () => ({
      ...jest.requireActual('./UserEditHelpers'),
      resourcesLoaded: jest.fn().mockReturnValue(0),
    }));
    props = {
      ...props,
      match: { params: { id: 0 } },
      resources: {
        perms: { records: [{ id: 1 }], permissionName: 'test' },
        patronGroups: {
          records: [{ id: '1', group: 'tst', desc: 'description' }],
        },
        addressTypes: {
          records: [{ id: '2', group: 'tst', desc: 'description' }],
        },
        servicePoints: {
          records: [{ id: '3', group: 'tst', desc: 'description' }],
        },
        departments: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
        permissions: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
      },
    };
    const { container } = renderWithRouter(<UserEdit {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing update', async () => {
    jest.mock('./UserEditHelpers', () => ({
      ...jest.requireActual('./UserEditHelpers'),
      resourcesLoaded: jest.fn().mockReturnValue(0),
    }));
    props = {
      ...props,
      match: { params: { id: 0 } },
      resources: {
        selUser: { records: [{ id: 0, check: 0 }] },
        perms: { records: [{ id: 1 }], permissionName: 'test' },
        patronGroups: {
          records: [{ id: '1', group: 'tst', desc: 'description' }],
        },
        addressTypes: {
          records: [{ id: '2', group: 'tst', desc: 'description' }],
        },
        servicePoints: {
          records: [{ id: '3', group: 'tst', desc: 'description' }],
        },
        departments: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
        permissions: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
      },
    };
    const { container } = renderWithRouter(<UserEdit {...props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing update description', async () => {
    props = {
      ...props,
      match: { params: { id: 1 } },
      resources: {
        selUser: { records: [{ id: 1, check: 0 }] },
        perms: { records: [{ id: 1 }], permissionName: 'test' },
        patronGroups: {
          records: [{ id: '1', group: 'tst', desc: 'description' }],
        },
        addressTypes: {
          records: [{ id: '2', group: 'tst', desc: 'description' }],
        },
        servicePoints: {
          records: [{ id: '3', group: 'tst', desc: 'description' }],
        },
        departments: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
        permissions: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
      },
    };
    const { container } = renderWithRouter(<UserEdit {...props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container).toBeInTheDocument();
  });

  it('should render with perms Failed update', async () => {
    props = {
      ...props,
      match: { params: { id: 1 } },
      mutator: {
        ...props.mutator,
        selUser: {
          PUT: jest.fn().mockRejectedValue({ catch: jest.fn() }),
        },
        permissions: {
          POST: jest.fn().mockResolvedValue({ data: {} }),
          PUT: jest.fn().mockRejectedValue({ catch: jest.fn() }),
        },
        requestPreferences: {
          POST: jest.fn().mockResolvedValue({ data: {} }),
          PUT: jest.fn().mockRejectedValue({ catch: jest.fn() }),
        },
      },
      resources: {
        selUser: { records: [{ id: 1, check: 1 }] },
        perms: { records: [{ id: 1 }], permissionName: 'test' },
        patronGroups: {
          records: [{ id: '1', group: 'tst', desc: 'description' }],
        },
        addressTypes: {
          records: [{ id: '2', group: 'tst', desc: 'description' }],
        },
        servicePoints: {
          records: [{ id: '3', group: 'tst', desc: 'description' }],
        },
        departments: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
        permissions: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
      },
    };
    const { container } = renderWithRouter(<UserEdit {...props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing permissions', async () => {
    props = {
      ...props,
      match: { params: { id: 1 } },
      resources: {
        selUser: { records: [{ id: 1, check: 1, active: 1 }] },
        perms: { records: [], permissionName: 'test' },
        patronGroups: {
          records: [{ id: '1', group: 'tst', desc: 'description' }],
        },
        addressTypes: {
          records: [{ id: '2', group: 'tst', desc: 'description' }],
        },
        servicePoints: {
          records: [{ id: '3', group: 'tst', desc: 'description' }],
        },
        departments: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
        permissions: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
      },
    };
    const { container } = renderWithRouter(<UserEdit {...props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing departments', () => {
    jest.mock('lodash', () => ({
      ...jest.requireActual('lodash'),
      cloneDeep: jest.fn().mockReturnValue({
        personal: false,
        active: 1,
        permissions: { permissionName: 'test' },
        departments: ['CS'],
      }),
      find: jest.fn().mockReturnValue(null),
      get: jest.fn().mockReturnValue(false),
    }));
    props = {
      ...props,
      match: {
        params: { id: 0 },
      },
      resources: {
        patronGroups: {
          records: [{ id: '1', group: 'tst', desc: 'description' }],
        },
        addressTypes: {
          records: [{ id: '2', group: 'tst', desc: 'description' }],
        },
        servicePoints: {
          records: [{ id: '3', group: 'tst', desc: 'description' }],
        },
        departments: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
        permissions: {
          records: [{ id: '4', group: 'tst', desc: 'description' }],
        },
      },
    };
    const { container } = renderWithRouter(
      <Provider store={store}>
        <UserEdit {...props} />
      </Provider>
    );
    expect(container).toBeInTheDocument();
  });

  it('should submit form and call update', async () => {
    const { container } = renderWithRouter(<UserEdit {...props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container.querySelector('#clickable-cancel')).toBeInTheDocument();
    expect(container.querySelector('#clickable-save')).toBeInTheDocument();
  });
  it('should cancel form', async () => {
    const { container } = renderWithRouter(<UserEdit {...props} />);
    const submitButton = container.querySelector('#clickable-cancel');
    await userEvent.click(submitButton);
    expect(container.querySelector('#clickable-cancel')).toBeInTheDocument();
    expect(container.querySelector('#clickable-save')).toBeInTheDocument();
  });
});
