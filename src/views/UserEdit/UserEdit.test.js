import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from '../../../test/jest/helpers/renderWithRouter';

import UserForm from './UserForm';
import UserEdit from './UserEdit';
import { KEYCLOAK_USER_EXISTANCE } from '../../constants';

const userFormData = {
  departments: [{
    value: 'department-id-1',
    label: 'department1',
  }],
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
};

jest.mock('../../components/Wrappers/withUserRoles', () => (Component) => {
  return Component;
});

jest.mock('@folio/service-interaction', () => ({
  NumberGeneratorModalButton: () => <div>NumberGeneratorModalButton</div>
}));

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  LoadingView: () => 'LoadingView',
}));
jest.mock('./UserForm', () => jest.fn(({ onSubmit, onCancel, onCancelKeycloakConfirmation, confirmCreateKeycloakUser }) => {
  return (
    <>
      <div>UserForm</div>
      <button type="button" id="clickable-cancel" onClick={onCancel}>
        Cancel Form
      </button>
      <button type="button" id="clickable-save" onClick={() => onSubmit(userFormData)}>
        Submit Form
      </button>

      <button type="button" id="cancel-confirmation" onClick={onCancelKeycloakConfirmation}>
        Cancel confirmation
      </button>
      <button
        type="button"
        id="submit-confirmation"
        onClick={() => confirmCreateKeycloakUser({ getState: jest.fn().mockReturnValue({ values: {
          assignedRoleIds: []
        } }) })}
      >
        Submit Confirmation
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

const props = {
  stripes: {
    hasPerm: jest.fn().mockReturnValue(true),
    hasInterface: jest.fn().mockReturnValue(true),
    okapi: {
      tenant: 'tenantId',
    },
  },
  resources: {
    selUser: {
      records: [{
        id: 'userId',
        departments: ['department-id-1', 'department-id-2'],
        preferredEmailCommunication: ['Programs', 'Support']
      }],
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
  updateUserRoles:jest.fn(),
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

describe('UserEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = renderWithRouter(<UserEdit {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing helpers', () => {
    jest.mock('./UserEditHelpers', () => ({
      ...jest.requireActual('./UserEditHelpers'),
      resourcesLoaded: jest.fn().mockReturnValue(0),
    }));
    const _props = {
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
    const { container } = renderWithRouter(<UserEdit {..._props} />);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing update', async () => {
    jest.mock('./UserEditHelpers', () => ({
      ...jest.requireActual('./UserEditHelpers'),
      resourcesLoaded: jest.fn().mockReturnValue(0),
    }));
    const _props = {
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
    const { container } = renderWithRouter(<UserEdit {..._props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing update description', async () => {
    const _props = {
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
    const { container } = renderWithRouter(<UserEdit {..._props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container).toBeInTheDocument();
  });

  it('should render with perms Failed update', async () => {
    const _props = {
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
    const { container } = renderWithRouter(<UserEdit {..._props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing permissions', async () => {
    const _props = {
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
    const { container } = renderWithRouter(<UserEdit {..._props} />);
    const submitButton = container.querySelector('#clickable-save');
    await userEvent.click(submitButton);
    expect(container).toBeInTheDocument();
  });

  it('should render without crashing departments', () => {
    const _props = {
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
    const { container } = renderWithRouter(<UserEdit {..._props} />);

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

    it('should save the user updates when the users interfaces is not 16.2', async () => {
      renderWithRouter(
        <UserEdit
          {...props}
          stripes={{
            ...props.stripes,
            hasInterface: () => false,
          }}
        />
      );
      await UserForm.mock.calls[0][0].onSubmit(userFormData);

      expect(props.mutator.requestPreferences.POST).toHaveBeenCalled();
      expect(props.updateProxies).toHaveBeenCalled();
      expect(props.updateSponsors).toHaveBeenCalled();
      expect(props.updateServicePoints).toHaveBeenCalled();
    });

    it('should update the user with correct data', async () => {
      const { getByText } = renderWithRouter(
        <UserEdit
          {...props}
          stripes={{
            ...props.stripes,
            hasInterface: () => false,
          }}
        />
      );

      const submitButton = getByText('Submit Form');
      await userEvent.click(submitButton);

      expect(props.mutator.selUser.PUT).toHaveBeenCalledWith(expect.objectContaining({
        departments: ['department-id-1'],
      }));
    });

    it('should create the user with correct data', async () => {
      const { getByText } = renderWithRouter(
        <UserEdit
          {...props}
          match={{ params: { id: '' } }}
        />
      );

      const submitButton = getByText('Submit Form');
      await userEvent.click(submitButton);

      expect(props.mutator.records.POST).toHaveBeenCalledWith(expect.objectContaining({
        departments: ['department-id-1'],
      }));
    });

    describe('when user has user profile edit', () => {
      it('should update permissions when user has "ui-users.perms.edit" permissions', async () => {
        const _props = {
          ...props,
          resources: {
            ...props.resources,
            perms: {
              records: [
                {
                  id: 'permUserRecordId',
                  permissions: ['ui-users.perms.edit', 'ui-users.edit']
                }
              ],
            },
          }
        };
        renderWithRouter(<UserEdit {..._props} />);

        await UserForm.mock.calls[0][0].onSubmit(userFormData);

        expect(props.mutator.permissions.PUT).toHaveBeenCalled();
      });

      it('should not update permissions when user has "ui-users.perms.view" permission', async () => {
        const _props = {
          ...props,
          stripes: {
            ...props.stripes,
            hasPerm: jest.fn().mockReturnValue(false),
          },
        };
        renderWithRouter(<UserEdit {..._props} />);

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

  describe('Keycloak confirmation modal', () => {
    const defaultProps = {
      stripes: {
        hasPerm: jest.fn().mockReturnValue(true),
        okapi: {
          tenant: 'tenantId',
        },
        hasInterface: jest.fn().mockReturnValue(true),
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
      isCreateKeycloakUserConfirmationOpen: true,
      submitCreateKeycloakUser: jest.fn(),
      onCancelKeycloakConfirmation: jest.fn(),
      confirmCreateKeycloakUser: jest.fn(),
      setIsCreateKeycloakUserConfirmationOpen: jest.fn(),
    };
    beforeEach(() => {
      jest.unmock('./UserForm');
    });
    it('cancel confirmation', async () => {
      const { container } = renderWithRouter(<UserEdit {...defaultProps} />);
      const cancelButton = container.querySelector('#cancel-confirmation');

      await userEvent.click(cancelButton);
      expect(defaultProps.history.push).toHaveBeenCalled();
    });

    it('submit confirmation', async () => {
      const mockSubmitCreateKeycloakUser = jest.fn();
      const alteredProps = { ...defaultProps,
        confirmCreateKeycloakUser: mockSubmitCreateKeycloakUser };

      const { container } = renderWithRouter(<UserEdit {...alteredProps} />);
      const submitButton = container.querySelector('#submit-confirmation');

      await userEvent.click(submitButton);

      expect(mockSubmitCreateKeycloakUser).toHaveBeenCalledTimes(1);
    });

    describe('on submit form check keycloak existence', () => {
      it('calls history.push in case if hasInterface is FALSE', async () => {
        const mockSubmitCreateKeycloakUser = jest.fn();
        const mockUpdateRoles = jest.fn();
        const alteredProps = { ...defaultProps,
          stripes: { ...defaultProps.stripes, hasInterface: jest.fn().mockReturnValue(false) },
          submitCreateKeycloakUser: mockSubmitCreateKeycloakUser,
          updateUserRoles: mockUpdateRoles };

        const { container } = renderWithRouter(<UserEdit {...alteredProps} />);
        const submitButton = container.querySelector('#clickable-save');

        await userEvent.click(submitButton);

        expect(alteredProps.history.push).toHaveBeenCalled();
      });

      it('calls history.push in case if hasInterface True, user exists in Keycloak and old assignedRoleIds and updated are equal', async () => {
        const mockSubmitCreateKeycloakUser = jest.fn();
        const alteredProps = { ...defaultProps,
          confirmCreateKeycloakUser: mockSubmitCreateKeycloakUser,
          checkAndHandleKeycloakAuthUser: jest.fn() };

        const { container } = renderWithRouter(<UserEdit {...alteredProps} />);
        const submitButton = container.querySelector('#clickable-save');

        await userEvent.click(submitButton);

        expect(alteredProps.checkAndHandleKeycloakAuthUser).toHaveBeenCalled();
      });

      it('calls submit create keycloak user', async () => {
        const mockSubmitCreateKeycloakUser = jest.fn();
        const mockUpdateRoles = jest.fn();
        const alteredProps = { ...defaultProps,
          submitCreateKeycloakUser: mockSubmitCreateKeycloakUser,
          updateUserRoles: mockUpdateRoles,
          checkUserInKeycloak: jest.fn().mockReturnValue(KEYCLOAK_USER_EXISTANCE.exist),
          assignedRoleIds: [1, 2, 3] };

        const { container } = renderWithRouter(<UserEdit {...alteredProps} />);
        const submitButton = container.querySelector('#clickable-save');

        await userEvent.click(submitButton);
      });
    });
  });
});
