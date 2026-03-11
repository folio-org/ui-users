import { act } from 'react';

import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from '../../../test/jest/helpers/renderWithRouter';

import UserEdit from './UserEdit';
import UserForm from './UserForm';

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

function mockUserFormImplementation({ onSubmit, onCancel, onCancelKeycloakConfirmation, confirmCreateKeycloakUser }) {
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
}

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
jest.mock('./UserForm', () => jest.fn(mockUserFormImplementation));
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
    user: { user: { id: 'other-user-id' } },
  },
  resources: {
    selUser: {
      records: [{
        id: 'userId',
        departments: ['department-id-1', 'department-id-2'],
        preferredEmailCommunication: ['Programs', 'Support']
      }],
      isPending: false,
    },
    patronGroups: {
      records: [],
      isPending: false,
    },
    perms: {
      records: [{ id: 'permUserRecordId' }],
      isPending: false,
    },
    addressTypes: {
      records: [],
      isPending: false,
    },
    servicePoints: {
      records: [],
      isPending: false,
    },
    departments: {
      records: [],
      isPending: false,
    },
    userReadingRoomPermissions: {
      records: [],
      isPending: false,
    },
    uniquenessValidator: { records: [], isPending: false },
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
    extend: jest.fn(function extend() { return this; }),
    get: jest.fn(() => ({ json: () => Promise.resolve() })),
    post: jest.fn(() => ({ json: () => Promise.resolve({}) })),
    put: jest.fn(() => ({ json: () => Promise.resolve({}) })),
  },
  assignedRoleIds: {},
  isLoadingAffiliationRoles: false,
  setIsCreateKeycloakUserConfirmationOpen: jest.fn(),
};

const getUserEdit = (_props = {}) => <UserEdit {..._props} />;

const renderUserEdit = async (userProps) => {
  const result = renderWithRouter(getUserEdit(props));

  // Trigger componentDidUpdate to update isLoading to false
  const { rerender } = await act(async () => renderWithRouter(
    getUserEdit(userProps),
    { rerender: result.rerender }
  ));

  return {
    ...result,
    rerender,
  };
};

describe('UserEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    UserForm.mockImplementation(mockUserFormImplementation);
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

  it('should render loading', () => {
    const { getByText } = renderWithRouter(<UserEdit {...props} />);
    expect(getByText('LoadingView')).toBeInTheDocument();
  });



  describe('Save user form', () => {
    it('should handle user updates', async () => {
      const { container } = await renderUserEdit(props);
      const submitButton = container.querySelector('#clickable-save');
      await userEvent.click(submitButton);

      expect(props.mutator.requestPreferences.POST).toHaveBeenCalled();
      expect(props.updateProxies).toHaveBeenCalled();
      expect(props.updateSponsors).toHaveBeenCalled();
      expect(props.updateServicePoints).toHaveBeenCalled();
    });

    it('should save the user updates when the users interfaces is not 16.2', async () => {
      const { container } = await renderUserEdit({
        ...props,
        stripes: {
          ...props.stripes,
          hasInterface: () => false,
        },
      });
      const submitButton = container.querySelector('#clickable-save');
      await userEvent.click(submitButton);

      expect(props.mutator.requestPreferences.POST).toHaveBeenCalled();
      expect(props.updateProxies).toHaveBeenCalled();
      expect(props.updateSponsors).toHaveBeenCalled();
      expect(props.updateServicePoints).toHaveBeenCalled();
    });

    it('should update the user with correct data', async () => {
      const { container } = await renderUserEdit({
        ...props,
        resources: {
          ...props.resources,
          uniquenessValidator: { records: [] }
        },
        stripes: {
          ...props.stripes,
          hasInterface: () => false,
        },
      });

      const submitButton = container.querySelector('#clickable-save');
      await userEvent.click(submitButton);

      expect(props.mutator.selUser.PUT).toHaveBeenCalledWith(expect.objectContaining({
        departments: ['department-id-1'],
      }));
    });

    it('should create the user with correct data', async () => {
      const { container } = await renderUserEdit({
        ...props,
        resources: {
          ...props.resources,
          uniquenessValidator: { records: [] },
          selUser: { records: [] }
        },
        match: { params: { id: '' } },
      });

      const submitButton = container.querySelector('#clickable-save');
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
        const { container } = await renderUserEdit(_props);
        const submitButton = container.querySelector('#clickable-save');
        await userEvent.click(submitButton);

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
        const { container } = await renderUserEdit(_props);
        const submitButton = container.querySelector('#clickable-save');
        await userEvent.click(submitButton);

        expect(props.mutator.perms.PUT).not.toHaveBeenCalled();
      });
    });

    describe('service points update', () => {
      const ownUserId = 'userId';
      const servicePointsBaseProps = {
        ...props,
        stripes: {
          hasPerm: jest.fn().mockReturnValue(true),
          hasInterface: jest.fn().mockReturnValue(true),
          okapi: { tenant: 'tenantId' },
          user: { user: { id: ownUserId } },
        },
        match: { params: { id: ownUserId } },
        updateServicePoints: jest.fn(),
        checkAndHandleKeycloakAuthUser: jest.fn(async (afterUpdate) => { await afterUpdate(); }),
        setIsCreateKeycloakUserConfirmationOpen: jest.fn(),
      };

      describe('when user edits own record with a non-NONE service point', () => {
        it('should call updateServicePoints before the user has been updated', async () => {
          UserForm.mockImplementation(({ onSubmit }) => (
            <button
              type="button"
              id="clickable-save"
              onClick={() => onSubmit({ ...userFormData, preferredServicePoint: 'sp-id-1' })}
            >
              Submit Form
            </button>
          ));

          const updateServicePoints = jest.fn();
          const checkAndHandleKeycloakAuthUser = jest.fn(async (afterUpdate) => { await afterUpdate(); });
          const alteredProps = {
            ...servicePointsBaseProps,
            updateServicePoints,
            checkAndHandleKeycloakAuthUser,
          };

          const { container } = await renderUserEdit(alteredProps);
          await userEvent.click(container.querySelector('#clickable-save'));

          expect(updateServicePoints).toHaveBeenCalled();
          expect(updateServicePoints.mock.invocationCallOrder[0]).toBeLessThan(
            checkAndHandleKeycloakAuthUser.mock.invocationCallOrder[0]
          );
        });
      });

      describe('when editing another user record with PREFERRED_SP_NONE', () => {
        it('should call updateServicePoints before the user has been updated', async () => {
          UserForm.mockImplementation(({ onSubmit }) => (
            <button
              type="button"
              id="clickable-save"
              onClick={() => onSubmit({ ...userFormData, preferredServicePoint: '-' })}
            >
              Submit Form
            </button>
          ));

          const updateServicePoints = jest.fn();
          const checkAndHandleKeycloakAuthUser = jest.fn(async (afterUpdate) => { await afterUpdate(); });
          const alteredProps = {
            ...servicePointsBaseProps,
            match: { params: { id: 'userId-2' } },
            resources: {
              ...props.resources,
              selUser: {
                records: [{ id: 'userId-2', departments: [] }],
                isPending: false,
              },
            },
            updateServicePoints,
            checkAndHandleKeycloakAuthUser,
          };

          const { container } = await renderUserEdit(alteredProps);
          await userEvent.click(container.querySelector('#clickable-save'));

          expect(updateServicePoints).toHaveBeenCalled();
          expect(updateServicePoints.mock.invocationCallOrder[0]).toBeLessThan(
            checkAndHandleKeycloakAuthUser.mock.invocationCallOrder[0]
          );
        });
      });

      describe('when user edits own record with PREFERRED_SP_NONE', () => {
        it('should defer updateServicePoints until after user data is saved', async () => {
          UserForm.mockImplementation(({ onSubmit }) => (
            <button
              type="button"
              id="clickable-save"
              onClick={() => onSubmit({ ...userFormData, preferredServicePoint: '-' })}
            >
              Submit Form
            </button>
          ));

          let resolveKeycloakHandler;
          const updateServicePoints = jest.fn();
          const alteredProps = {
            ...servicePointsBaseProps,
            updateServicePoints,
            checkAndHandleKeycloakAuthUser: jest.fn((afterUpdate) => (
              new Promise(resolve => {
                resolveKeycloakHandler = async () => {
                  await afterUpdate();
                  resolve();
                };
              })
            )),
          };

          const { container } = await renderUserEdit(alteredProps);
          await userEvent.click(container.querySelector('#clickable-save'));

          expect(updateServicePoints).not.toHaveBeenCalled();

          await act(async () => { await resolveKeycloakHandler(); });

          expect(updateServicePoints).toHaveBeenCalled();
          expect(servicePointsBaseProps.setIsCreateKeycloakUserConfirmationOpen).toHaveBeenCalledWith(false);
        });
      });
    });
  });

  describe('Cancel user form', () => {
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
          isPending: false,
        },
        patronGroups: {
          records: [],
          isPending: false,
        },
        perms: {
          records: [{ id: 'permUserRecordId' }],
          isPending: false,
        },
        addressTypes: {
          records: [],
          isPending: false,
        },
        servicePoints: {
          records: [],
          isPending: false,
        },
        departments: {
          records: [],
          isPending: false,
        },
        userReadingRoomPermissions: {
          records: [],
          isPending: false,
        },
        uniquenessValidator: { records: [], isPending: false },
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
        extend: jest.fn(function extend() { return this; }),
        get: jest.fn(() => ({ json: () => Promise.resolve() })),
        post: jest.fn(() => ({ json: () => Promise.resolve({}) })),
        put: jest.fn(() => ({ json: () => Promise.resolve({}) })),
      },
      assignedRoleIds: {},
      isLoadingAffiliationRoles: false,
    };

    it('should call history.push on cancelling user edit form', async () => {
      const { container } = await renderUserEdit(defaultProps);
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
      const { container } = await renderUserEdit(alteredProps);
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
        user: { user: { id: 'other-user-id' } },
      },
      resources: {
        selUser: {
          records: [{ id: 'userId' }],
          isPending: false,
        },
        patronGroups: {
          records: [],
          isPending: false,
        },
        perms: {
          records: [{ id: 'permUserRecordId' }],
          isPending: false,
        },
        addressTypes: {
          records: [],
          isPending: false,
        },
        servicePoints: {
          records: [],
          isPending: false,
        },
        departments: {
          records: [],
          isPending: false,
        },
        userReadingRoomPermissions: {
          records: [],
          isPending: false,
        },
        uniquenessValidator: { records: [], isPending: false },
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
        extend: jest.fn(function extend() { return this; }),
        get: jest.fn(() => ({ json: () => Promise.resolve() })),
        post: jest.fn(() => ({ json: () => Promise.resolve({}) })),
        put: jest.fn(() => ({ json: () => Promise.resolve({}) })),
      },
      assignedRoleIds: {},
      isLoadingAffiliationRoles: false,
      isCreateKeycloakUserConfirmationOpen: true,
      submitCreateKeycloakUser: jest.fn(),
      onCancelKeycloakConfirmation: jest.fn(),
      confirmCreateKeycloakUser: jest.fn(),
      setIsCreateKeycloakUserConfirmationOpen: jest.fn(),
    };

    it('cancel confirmation', async () => {
      const { container } = await renderUserEdit(defaultProps);
      const cancelButton = container.querySelector('#cancel-confirmation');

      await userEvent.click(cancelButton);
      expect(defaultProps.history.push).toHaveBeenCalled();
    });

    it('submit confirmation', async () => {
      const mockSubmitCreateKeycloakUser = jest.fn();
      const alteredProps = { ...defaultProps,
        confirmCreateKeycloakUser: mockSubmitCreateKeycloakUser };

      const { container } = await renderUserEdit(alteredProps);
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

        const { container } = await renderUserEdit(alteredProps);
        const submitButton = container.querySelector('#clickable-save');

        await userEvent.click(submitButton);

        expect(alteredProps.history.push).toHaveBeenCalled();
      });

      it('calls history.push in case if hasInterface True, user exists in Keycloak and old assignedRoleIds and updated are equal', async () => {
        const mockSubmitCreateKeycloakUser = jest.fn();
        const alteredProps = { ...defaultProps,
          confirmCreateKeycloakUser: mockSubmitCreateKeycloakUser,
          checkAndHandleKeycloakAuthUser: jest.fn() };

        const { container } = await renderUserEdit(alteredProps);
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
          assignedRoleIds: { 1: true, 2: true, 3: true } };

        const { container } = renderWithRouter(<UserEdit {...alteredProps} />);
        const submitButton = container.querySelector('#clickable-save');

        await userEvent.click(submitButton);
      });
    });

    describe('onCancelKeycloakConfirmation', () => {
      describe('when updateSP is not set', () => {
        it('should redirect without calling setIsCreateKeycloakUserConfirmationOpen', async () => {
          const setIsCreateKeycloakUserConfirmationOpen = jest.fn();
          const alteredProps = {
            ...defaultProps,
            setIsCreateKeycloakUserConfirmationOpen,
          };

          const { container } = await renderUserEdit(alteredProps);
          const cancelButton = container.querySelector('#cancel-confirmation');
          await userEvent.click(cancelButton);

          expect(defaultProps.history.push).toHaveBeenCalled();
          expect(setIsCreateKeycloakUserConfirmationOpen).not.toHaveBeenCalled();
        });
      });

      describe('when updateSP is set (own user with PREFERRED_SP_NONE)', () => {
        it('should call setIsCreateKeycloakUserConfirmationOpen(false), invoke updateServicePoints, and redirect', async () => {
          const ownUserId = 'userId';
          const updateServicePoints = jest.fn();
          const setIsCreateKeycloakUserConfirmationOpen = jest.fn();

          UserForm.mockImplementation(({ onSubmit, onCancelKeycloakConfirmation }) => (
            <>
              <button
                type="button"
                id="clickable-save"
                onClick={() => onSubmit({ ...userFormData, preferredServicePoint: '-' })}
              >
                Submit
              </button>
              <button
                type="button"
                id="cancel-confirmation"
                onClick={onCancelKeycloakConfirmation}
              >
                Cancel
              </button>
            </>
          ));

          const alteredProps = {
            ...defaultProps,
            stripes: {
              ...defaultProps.stripes,
              user: { user: { id: ownUserId } },
            },
            match: { params: { id: ownUserId } },
            updateServicePoints,
            setIsCreateKeycloakUserConfirmationOpen,
            checkAndHandleKeycloakAuthUser: jest.fn().mockResolvedValue(undefined),
          };

          const { container } = await renderUserEdit(alteredProps);
          await userEvent.click(container.querySelector('#clickable-save'));

          await act(async () => {
            await userEvent.click(container.querySelector('#cancel-confirmation'));
          });

          expect(setIsCreateKeycloakUserConfirmationOpen).toHaveBeenCalledWith(false);
          expect(updateServicePoints).toHaveBeenCalled();
          expect(defaultProps.history.push).toHaveBeenCalled();
        });
      });
    });

    describe('confirmCreateKeycloakUser', () => {
      it('should redirect when the afterUpdate callback passed to confirmCreateKeycloakUser is invoked', async () => {
        const historyPush = jest.fn();
        let capturedAfterUpdate;
        const confirmCreateKeycloakUser = jest.fn((afterUpdate) => {
          capturedAfterUpdate = afterUpdate;
        });

        const alteredProps = {
          ...defaultProps,
          history: { push: historyPush },
          confirmCreateKeycloakUser,
        };

        const { container } = await renderUserEdit(alteredProps);
        await userEvent.click(container.querySelector('#submit-confirmation'));

        expect(capturedAfterUpdate).toBeDefined();
        await act(async () => { await capturedAfterUpdate(); });

        expect(historyPush).toHaveBeenCalled();
      });
    });
  });
});
