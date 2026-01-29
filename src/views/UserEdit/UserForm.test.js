import { act } from 'react';

import { FormattedMessage } from 'react-intl';

import { HasCommand } from '@folio/stripes/components';
import {
  screen,
  within,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from '../../../test/jest/helpers/renderWithRouter';
import { EditFeesFines } from '../../components/EditSections';
import { USER_TYPES } from '../../constants';
import {
  useUserAffiliations,
  useUserTenantPermissions,
} from '../../hooks';
import UserForm, { validate } from './UserForm';

HasCommand.mockImplementation(({ commands, children }) => (
  <span>
    {commands.map((command, index) => (
      <button
        key={index}
        type="button"
        data-testid={`keyboard-shortcut-${command.name}`}
        onClick={(e) => command.handler(e)}
      >
        {command.name}
      </button>
    ))}
    {children}
  </span>
));

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  EditCustomFieldsRecord: jest.fn(() => 'EditCustomFieldsRecord'),
  useCustomFieldsQuery: jest.fn(() => ({
    customFields: [],
    isLoadingCustomFields: false,
    isCustomFieldsError: false,
    refetchCustomFields: jest.fn(),
  })),
}));
jest.mock(
  '../../components/EditSections',
  () => ({
    ...jest.requireActual('../../components/EditSections'),
    EditExtendedInfo: jest.fn(() => <div>EditExtendedInfo accordion</div>),
    EditProxy: jest.fn(() => <div>EditProxy accordion</div>),
    EditServicePoints: jest.fn(() => <div>EditServicePoints accordion</div>),
    EditReadingRoomAccess: jest.fn(() => <div>EditReadingRoomAccess</div>),
    EditUserInfo: jest.fn(() => <div>EditUserInfo accordion</div>),
    EditFeesFines: jest.fn(() => <div>EditFeesFines accordion</div>),
    EditUserRoles: jest.fn(() => <div>EditUserRoles accordion</div>)
  })
);

jest.mock('../../components/PermissionsAccordion/components/PermissionsModal', () => 'PermissionsModal');
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useUserAffiliations: jest.fn(),
  useUserTenantPermissions: jest.fn(),
}));
jest.mock(
  './TenantsPermissionsAccordion',
  () => jest.fn(() => <div>TenantsPermissionsAccordion accordion</div>),
);

jest.mock('@folio/service-interaction', () => () => <div>service-interaction</div>);

const mockOnCancel = jest.fn();
const mockOnSubmit = jest.fn();

const STRIPES = {
  connect: (Component) => Component,
  config: {},
  currency: 'USD',
  hasInterface: (i) => i !== 'roles',
  hasPerm: jest.fn().mockReturnValue(true),
  clone: jest.fn(),
  setToken: jest.fn(),
  locale: 'en-US',
  logger: {
    log: () => {},
  },
  okapi: {
    tenant: 'diku',
    url: 'https://folio-testing-okapi.dev.folio.org',
  },
  store: {
    getState: () => ({
      okapi: {
        token: 'abc',
      },
    }),
    dispatch: () => {},
    subscribe: () => {},
    replaceReducer: () => {},
  },
  timezone: 'UTC',
  user: {
    perms: {},
    user: {
      id: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
      username: 'diku_admin',
    },
  },
  withOkapi: true,
};

const formData = {
  patronGroups: [],
  addressTypes: [
    {
      addressType: 'Claim',
      id: 'claim-id',
    },
    {
      addressType: 'Home',
      id: 'home-id',
    },
    {
      addressType: 'Payment',
      id: 'payment-id',
    },
  ],
};

const initialValues = {
  id: 'id',
  creds: {
    password: 'password',
  },
  patronGroup: 'patronGroup',
  personal: {
    lastName: 'lastName',
    preferredContactTypeId: 'preferredContactTypeId',
    addresses: [
      {
        addressType: 'home-id',
      },
    ],
  },
  preferredServicePoint: 'preferredServicePoint',
  servicePoints: ['a', 'b'],
  username: 'username',
};

const renderUserForm = (props = {}) => renderWithRouter(
  <UserForm
    formData={formData}
    initialValues={initialValues}
    stripes={STRIPES}
    uniquenessValidator={{
      reset: jest.fn(),
      GET: jest.fn(),
    }}
    profilePictureConfig={{}}
    onCancel={mockOnCancel}
    onSubmit={mockOnSubmit}
    {...props}
  />
);

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useUserAffiliations
      .mockReturnValue({ affiliations: [] });
    useUserTenantPermissions
      .mockReturnValue({ isFetching: false });
  });

  describe('validate', () => {
    it('validates correctly-shaped data', () => {
      const result = validate({
        personal: {
          lastName: 'lastName',
          preferredContactTypeId: 'preferredContactTypeId',
          addresses: [
            { addressType: 'addressType' },
          ],
        },
        username: 'username',
        creds: {
          password: 'password',
        },
        patronGroup: 'patronGroup',
        servicePoints: ['a', 'b'],
        preferredServicePoint: 'preferredServicePoint',
      });

      expect(result.personal).toMatchObject({ addresses: [{}] });
      expect(result.personal.addresses.length).toBe(1);
    });

    describe('returns errors if required fields are missing', () => {
      it('requires personal', () => {
        const result = validate({});
        expect(result.personal.lastName).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredField" />);
      });

      it('requires personal.lastName', () => {
        const result = validate({ personal: {} });
        expect(result.personal.lastName).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredField" />);
      });

      it('requires personal.preferredContactTypeId', () => {
        const result = validate({ personal: {} });
        expect(result.personal.preferredContactTypeId).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredContactType" />);
      });

      it('not requires personal.preferredContactTypeId for shadow user', () => {
        const result = validate({ personal: {}, type: USER_TYPES.SHADOW });
        expect(result.personal.preferredContactTypeId).not.toBeDefined();
      });

      it('requires username when password is present', () => {
        const result = validate({ creds: { password: 'thunder-chicken' } });
        expect(result.username).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredUsername" />);
      });

      it('requires patronGroup', () => {
        const result = validate({ });
        expect(result.patronGroup).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredPatronGroup" />);
      });

      it('not requires patronGroup for shadow user', () => {
        const result = validate({ type: USER_TYPES.SHADOW });
        expect(result.patronGroup).not.toBeDefined();
      });

      it('requires personal.addresses to have an addressType', () => {
        const result = validate({ personal: { addresses: [{ 'monkey': 'bagel' }] } });
        expect(result.personal.addresses[0].addressType).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredAddressType" />);
      });

      it('requires a preferred service point when service points are assigned', () => {
        const result = validate({ servicePoints: ['a', 'b', 'c'] });
        expect(result.preferredServicePoint).toMatchObject(<FormattedMessage id="ui-users.errors.missingRequiredPreferredServicePoint" />);
      });
    });
  });


  describe('renders accordions and other values', () => {
    it('shows permissions accordion in legacy mode', async () => {
      renderUserForm();

      expect(screen.getByText('TenantsPermissionsAccordion accordion')).toBeTruthy();
    });

    it('shows permissions accordion when "roles" interface is NOT present', async () => {
      renderUserForm();

      expect(screen.queryByText('TenantsPermissionsAccordion accordion')).toBeInTheDocument();
    });

    it('show roles accordion when "roles" interface is present', async () => {
      renderUserForm({
        stripes: {
          ...STRIPES,
          hasInterface: () => true,
        },
      });

      expect(screen.queryByText('EditUserRoles accordion')).toBeInTheDocument();
    });

    it('renders pronouns', () => {
      renderUserForm({
        initialValues: {
          ...initialValues,
          personal: {
            ...initialValues.personal,
            pronouns: 'r2/d2',
          },
        },
      });

      expect(screen.getByText('(r2/d2)')).toBeInTheDocument();
    });
  });

  describe('when creating a new user', () => {
    const createModeInitialValues = {
      // No id field means create mode (isEditing = false)
      creds: {
        password: 'password',
      },
      patronGroup: 'patronGroup',
      personal: {
        lastName: 'lastName',
        preferredContactTypeId: 'preferredContactTypeId',
        addresses: [
          {
            addressType: 'home-id',
          },
        ],
      },
      preferredServicePoint: 'preferredServicePoint',
      servicePoints: ['a', 'b'],
      username: 'username',
    };

    it('should not show permissions accordion in create mode', () => {
      renderUserForm({
        initialValues: createModeInitialValues,
        stripes: {
          ...STRIPES,
          hasInterface: () => false, // roles interface is NOT present
        },
      });

      expect(screen.queryByText('TenantsPermissionsAccordion accordion')).not.toBeInTheDocument();
    });

    it('should not show roles accordion in create mode', () => {
      renderUserForm({
        initialValues: createModeInitialValues,
        stripes: {
          ...STRIPES,
          hasInterface: () => true, // roles interface is present
        },
      });

      expect(screen.queryByText('EditUserRoles accordion')).not.toBeInTheDocument();
    });

    it('should pass props to EditFeesFines component correctly', () => {
      renderUserForm({
        initialValues: createModeInitialValues,
        stripes: {
          ...STRIPES,
          hasInterface: () => true,
        },
      });

      expect(EditFeesFines).toHaveBeenCalledWith({
        accordionId: 'feesFines',
        isCreateMode: true,
      }, {});
    });
  });

  describe('when editing an existing user', () => {
    const editModeInitialValues = {
      id: 'existing-user-id', // ID present means edit mode (isEditing = true)
      creds: {
        password: 'password',
      },
      patronGroup: 'patronGroup',
      personal: {
        lastName: 'lastName',
        preferredContactTypeId: 'preferredContactTypeId',
        addresses: [
          {
            addressType: 'home-id',
          },
        ],
      },
      preferredServicePoint: 'preferredServicePoint',
      servicePoints: ['a', 'b'],
      username: 'username',
    };

    it('should show permissions accordion in edit mode when roles interface is NOT present', () => {
      renderUserForm({
        initialValues: editModeInitialValues,
        stripes: {
          ...STRIPES,
          hasInterface: () => false, // roles interface is NOT present
        },
      });

      expect(screen.queryByText('TenantsPermissionsAccordion accordion')).toBeInTheDocument();
      expect(screen.queryByText('EditUserRoles accordion')).not.toBeInTheDocument();
    });

    it('should show roles accordion in edit mode when roles interface is present', () => {
      renderUserForm({
        initialValues: editModeInitialValues,
        stripes: {
          ...STRIPES,
          hasInterface: () => true, // roles interface is present
        },
      });

      expect(screen.queryByText('EditUserRoles accordion')).toBeInTheDocument();
      expect(screen.queryByText('TenantsPermissionsAccordion accordion')).not.toBeInTheDocument();
    });
  });

  describe('when adding a new address', () => {
    beforeEach(async () => {
      renderUserForm({
        initialValues: {
          ...initialValues,
          personal: {
            ...initialValues.personal,
            addresses: [
              {
                addressType: 'payment-id',
              },
            ],
          },
        },
      });

      await act(() => userEvent.click(screen.getByText('stripes-smart-components.address.addAddress')));
    });

    it('should not change the address type of the previous address', async () => {
      const addressTypeSelects = screen.getAllByRole('combobox', { name: 'stripes-smart-components.addressEdit.label.addressType' });

      expect(within(addressTypeSelects[0]).getByText('Payment').selected).toBeTruthy();
    });

    it('should not have address type field selected for the new row', () => {
      const addressTypeSelects = screen.getAllByRole('combobox', { name: 'stripes-smart-components.addressEdit.label.addressType' });

      expect(within(addressTypeSelects[1]).getByText('ui-users.contact.selectAddressType').selected).toBeTruthy();
    });
  });

  describe('handleSaveKeyCommand', () => {
    describe('when form is disabled (pristine)', () => {
      it('should not call handleSubmit when save keyboard shortcut is triggered', async () => {
        renderUserForm();

        const saveKeyboardShortcut = screen.getByTestId('keyboard-shortcut-save');

        await act(async () => {
          await userEvent.click(saveKeyboardShortcut);
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    describe('when form is not disabled', () => {
      it('should call handleSubmit when save keyboard shortcut is triggered on dirty form', async () => {
        renderUserForm();

        const preferredContactSelect = screen.getByRole('combobox', { name: 'ui-users.contact.preferredContact' });

        await act(async () => {
          await userEvent.selectOptions(preferredContactSelect, '001');
        });

        const saveKeyboardShortcut = screen.getByTestId('keyboard-shortcut-save');

        await act(async () => {
          await userEvent.click(saveKeyboardShortcut);
        });

        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  // this fails:
  //   Element type is invalid: expected a string (for built-in components)
  //   or a class/function (for composite components) but got: undefined.
  //   You likely forgot to export your component from the file it's defined
  //   in, or you might have mixed up default and named imports.
  // not sure exactly what the problem is. Maybe we need to mock stripesFinalForm?
  describe.skip('UserForm calls submit handler', () => {
    // const submitHandler = jest.fn();
    // const props = {
    //   formData: {
    //     patronGroups: [],
    //   },
    //   initialValues: {
    //     id: 'id',
    //     creds: {
    //       password: 'password',
    //     },
    //     patronGroup: 'patronGroup',
    //     personal: {
    //       lastName: 'lastName',
    //       preferredContactTypeId: 'preferredContactTypeId',
    //       addresses: [
    //         { addressType: 'addressType' },
    //       ],
    //     },
    //     preferredServicePoint: 'preferredServicePoint',
    //     servicePoints: ['a', 'b'],
    //     username: 'username',
    //   },
    //   onCancel: jest.fn(),
    //   onSubmit: jest.fn(),
    //   uniquenessValidator: {
    //     reset: jest.fn(),
    //     GET: jest.fn(),
    //   }
    // };

    // renderWithRouter(<UserForm {...props} />);
    // userEvent.click(screen.getByText('ui-users.saveAndClose'));
    // expect(submitHandler).toHaveBeenCalled();
  });
});
