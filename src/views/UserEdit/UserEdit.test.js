import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';

import UserForm from './UserForm';
import UserEdit from './UserEdit';

const userFormData = {
  requestPreferences: {},
  personal: {
    addresses: [],
    email: 'ex@mp.le',
  },
  externalSystemId: '  ',
  permissions: {
    tenantId: [{ permissionName: 'users.item.get' }],
    testTenant: [{ permissionName: 'users.item.get' }],
  },
  readingRoomsAccessList: [
    {
      'id': '2205004b-ca51-4a14-87fd-938eefa8f5df',
      'userId': '2205005b-ca51-4a04-87fd-938eefa8f6de',
      'readingRoomId': 'ea7ac988-ede1-466b-968c-46a770333b14',
      'readingRoomName': 'rr-4',
      'access': 'ALLOWED',
      'notes': 'Allowed for this reading room...',
      'metadata': {
        'createdDate': '2024-05-15 18:39:31',
        'createdByUserId': '21457ab5-4635-4e56-906a-908f05e9233b',
        'updatedDate': '2024-05-15 18:40:27',
        'updatedByUserId': '21457ab5-4635-4e56-906a-908f05e9233b'
      }
    }
  ],
};

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  LoadingView: () => 'LoadingView',
}));
jest.mock('./UserForm', () => jest.fn(({ onSubmit, onCancel }) => {
  return (
    <>
      <div>UserForm </div>
      <button type="button" id="clickable-cancel" onClick={onCancel}>
        Cancel Form
      </button>
      <button type="button" id="clickable-save" onClick={() => onSubmit(userFormData)}>
        Submit Form
      </button>
    </>
  );
}));
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

describe('UserEdit', () => {
  let props = {
    stripes: {
      hasPerm: jest.fn().mockReturnValue(true),
      okapi: {
        tenant: 'tenantId',
      },
    },
    resources: {
      selUser: {
        records: [{ id: 'userId' }],
      },
      patronGroups: {
        records: [],
      },
      perms: {
        records: [{ id: 'permUserRecordId' }],
      },
      addressTypes: {
        records: [],
      },
      servicePoints: {
        records: [],
      },
      departments: {
        records: [],
      },
      userReadingRoomPermissions: {
        records: [],
      },
    },
    history: {
      push: jest.fn(),
    },
    location: {
      search: '?filters=active.active'
    },
    match: { params: { id: 'userId' } },
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
        PUT: jest.fn().mockResolvedValue({ data: {} }),
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
      userReadingRoomPermissions: {
        PUT: jest.fn().mockResolvedValue({ data: {} }),
        GET: jest.fn().mockResolvedValue({ data: {} }),
      }
    },
    getProxies: jest.fn(),
    getSponsors: jest.fn(),
    okapiKy: {
      extend: jest.fn(() => props.okapiKy),
      get: jest.fn(() => ({ json: () => Promise.resolve() })),
      post: jest.fn(() => ({ json: () => Promise.resolve({}) })),
      put: jest.fn(() => ({ json: () => Promise.resolve({}) })),
    },
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
        userReadingRoomPermissions: {
          records: [],
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
        userReadingRoomPermissions: {
          records: [],
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
        userReadingRoomPermissions: {
          records: [],
        },
      },
    };
    console.log('mutator ', props.mutator);
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
        userReadingRoomPermissions: {
          records: [],
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
        userReadingRoomPermissions: {
          records: [],
        },
      },
    };
    const { container } = renderWithRouter(<UserEdit {...props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing departments', () => {
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
        userReadingRoomPermissions: {
          records: [],
        },
      },
    };
    const { container } = renderWithRouter(<UserEdit {...props} />);

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

  describe('Save user form', () => {
    it('should handle user updates', async () => {
      renderWithRouter(<UserEdit {...props} />);

      await UserForm.mock.calls[0][0].onSubmit(userFormData);

      expect(props.mutator.requestPreferences.POST).toHaveBeenCalled();
      expect(props.updateProxies).toHaveBeenCalled();
      expect(props.updateSponsors).toHaveBeenCalled();
      expect(props.updateServicePoints).toHaveBeenCalled();
    });

    describe('when user has user profile edit', () => {
      it('should update permissions when user has "ui-users.editperms" permissions', async () => {
        props = {
          ...props,
          resources: {
            ...props.resources,
            perms: {
              records: [
                {
                  id: 'permUserRecordId',
                  permissions: ['ui-users.editperms', 'ui-users.edit']
                }
              ],
            },
          }
        };
        renderWithRouter(<UserEdit {...props} />);

        await UserForm.mock.calls[0][0].onSubmit(userFormData);

        expect(props.mutator.permissions.PUT).toHaveBeenCalled();
      });

      it('should not update permissions when user has "ui-users.viewperms" permission', async () => {
        props = {
          ...props,
          stripes: {
            ...props.stripes,
            hasPerm: jest.fn().mockReturnValue(false),
          },
        };
        renderWithRouter(<UserEdit {...props} />);

        await UserForm.mock.calls[0][0].onSubmit(userFormData);

        expect(props.mutator.perms.PUT).not.toHaveBeenCalled();
      });
    });
  });

  describe('Cancel user form', () => {
    beforeEach(() => {
      jest.unmock('./UserForm');
    });

    const defaultProps = {
      stripes: {
        hasPerm: jest.fn().mockReturnValue(true),
        okapi: {
          tenant: 'tenantId',
        },
      },
      resources: {
        selUser: {
          records: [{ id: 'userId' }],
        },
        patronGroups: {
          records: [],
        },
        perms: {
          records: [{ id: 'permUserRecordId' }],
        },
        addressTypes: {
          records: [],
        },
        servicePoints: {
          records: [],
        },
        departments: {
          records: [],
        },
        userReadingRoomPermissions: {
          records: []
        },
      },
      history: {
        push: jest.fn(),
      },
      location: {
        pathname: '/users/userId/edit',
        search: '?filters=active.active',
        state: undefined,
      },
      match: { params: { id: 'userId' } },
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
          PUT: jest.fn().mockResolvedValue({ data: {} }),
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
      okapiKy: {
        extend: jest.fn(() => props.okapiKy),
        get: jest.fn(() => ({ json: () => Promise.resolve() })),
        post: jest.fn(() => ({ json: () => Promise.resolve({}) })),
        put: jest.fn(() => ({ json: () => Promise.resolve({}) })),
      },
    };

    it('should call history.push on cancelling user edit form', async () => {
      const { container } = renderWithRouter(<UserEdit {...defaultProps} />);
      const cancelButton = container.querySelector('#clickable-cancel');
      await userEvent.click(cancelButton);
      expect(defaultProps.history.push).toHaveBeenCalled();
    });

    it('should call history.push on cancelling new user form', async () => {
      const alteredProps = {
        ...defaultProps,
        match: {
          ...props.match,
          params:{}
        }
      };
      const { container } = renderWithRouter(<UserEdit {...alteredProps} />);
      const cancelButton = container.querySelector('#clickable-cancel');
      await userEvent.click(cancelButton);
      expect(alteredProps.history.push).toHaveBeenCalled();
    });
  });
});
