import { FormattedMessage } from 'react-intl';
import {
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import { USER_TYPES } from '../../constants';
import {
  useUserAffiliations,
  useUserTenantPermissions,
} from '../../hooks';
import UserForm, { validate } from './UserForm';

jest.mock(
  '../../components/EditSections',
  () => ({
    EditContactInfo: jest.fn(() => <div>EditContactInfo accordion</div>),
    EditExtendedInfo: jest.fn(() => <div>EditExtendedInfo accordion</div>),
    EditProxy: jest.fn(() => <div>EditProxy accordion</div>),
    EditServicePoints: jest.fn(() => <div>EditServicePoints accordion</div>),
    EditUserInfo: jest.fn(() => <div>EditUserInfo accordion</div>),
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

describe('UserForm', () => {
  beforeEach(() => {
    useUserAffiliations
      .mockClear()
      .mockReturnValue({ affiliations: [] });
    useUserTenantPermissions
      .mockClear()
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


  describe('renders accordions', () => {
    const props = {
      formData: {
        patronGroups: [],
      },
      initialValues: {
        id: 'id',
        creds: {
          password: 'password',
        },
        patronGroup: 'patronGroup',
        personal: {
          lastName: 'lastName',
          preferredContactTypeId: 'preferredContactTypeId',
          addresses: [
            { addressType: 'addressType' },
          ],
        },
        preferredServicePoint: 'preferredServicePoint',
        servicePoints: ['a', 'b'],
        username: 'username',
      },
      onCancel: jest.fn(),
      onSubmit: jest.fn(),
      stripes: STRIPES,
      uniquenessValidator: {
        reset: jest.fn(),
        GET: jest.fn(),
      }
    };

    it('shows permissions accordion in legacy mode', async () => {
      renderWithRouter(<UserForm {...props} />);

      expect(screen.getByText('TenantsPermissionsAccordion accordion')).toBeTruthy();
    });

    it('omits permissions pane when "roles" interface is present', async () => {
      props.stripes.hasInterface = () => true;
      renderWithRouter(<UserForm {...props} />);

      expect(screen.queryByText('Permissions accordion')).toBeFalsy();
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
