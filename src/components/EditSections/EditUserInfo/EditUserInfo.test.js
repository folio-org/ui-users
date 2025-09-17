import { act } from 'react';

import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { Form } from 'react-final-form';

import '__mock__/stripesComponents.mock';

import { dayjs } from '@folio/stripes/components';

import renderWithRouter from 'helpers/renderWithRouter';

import EditUserInfo from './EditUserInfo';
import { isConsortiumEnabled } from '../../util';
import { USER_TYPES } from '../../../constants';
import {
  NUMBER_GENERATOR_OPTIONS_OFF,
  NUMBER_GENERATOR_OPTIONS_ON_EDITABLE,
  NUMBER_GENERATOR_OPTIONS_ON_NOT_EDITABLE,
} from '../../../settings/NumberGeneratorSettings/constants';

jest.mock('@folio/service-interaction', () => ({
  NumberGeneratorModalButton: ({ callback }) => (
    <button
      onClick={() => callback('abc123')}
      type="button"
    >
      NumberGeneratorModalButton
    </button>
  ),
}));

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Modal: jest.fn(({ children, label, footer, ...rest }) => {
    return (
      <div
        {...rest}
      >
        <h1>{label}</h1>
        {children}
        {footer}
      </div>
    );
  }),
  ModalFooter: jest.fn((props) => (
    <div>{props.children}</div>
  )),
  dayjs: jest.fn(),
}));

jest.mock('../../util', () => ({
  ...jest.requireActual('../../util'),
  isConsortiumEnabled: jest.fn(() => true),
}));

jest.mock('./components', () => ({
  EditUserProfilePicture : jest.fn(() => 'Profile Picture'),
  ChangeUserTypeModal: jest.fn(({ onChange, initialUserType, open }) => {
    if (!open) {
      return null;
    }

    return (
      <div>
        <h1>ChangeUserTypeModal</h1>
        <button type="button" onClick={() => onChange(initialUserType)}>Cancel</button>
      </div>
    );
  }),
}));

const onSubmit = jest.fn();

const getDayjsMock = (date) => {
  const dayjsObj = jest.requireActual('@folio/stripes/components').dayjs(date);

  return {
    ...dayjsObj,
    format: jest.fn().mockReturnValue('05/04/2027'),
    add: jest.fn().mockReturnThis(),
    tz: jest.fn().mockReturnThis(),
    endOf: jest.fn().mockReturnThis(),
    toISOString: jest.fn().mockReturnValue('2027-05-04T03:59:59.999Z'),
    isSameOrBefore: jest.fn().mockReturnValue(false),
    isBefore: jest.fn().mockReturnValue(true),
    isAfter: jest.fn().mockReturnValue(true),
  };
};

const arrayMutators = {
  concat: jest.fn(),
  move: jest.fn(),
  pop: jest.fn(),
  push: jest.fn(),
  remove: jest.fn(),
  removeBatch: jest.fn(),
  shift: jest.fn(),
  swap: jest.fn(),
  unshift: jest.fn(),
  update: jest.fn()
};

const renderEditUserInfo = (props) => {
  const component = () => (
    <>
      <EditUserInfo {...props} />
    </>
  );
  return renderWithRouter(
    <Form
      id="form-user"
      mutators={{
        ...arrayMutators
      }}
      onSubmit={onSubmit}
      render={component}
    />
  );
};

const changeMock = jest.fn();

const props = {
  form: {
    change: changeMock,
    getFieldState: jest.fn(() => {
      const dateIncrement = 1;
      const tomorrow = new Date();

      tomorrow.setDate(tomorrow.getDate() + dateIncrement);

      return { value: tomorrow.toJSON() };
    })
  },
  accordionId: 'editUserInfo',
  stripes: {
    connect: (Component) => Component,
    timezone: 'America/New_York',
    locale: 'en-US',
    hasInterface: () => true,
    hasPerm: () => true,
  },
  patronGroups: [{
    desc: 'Staff Member',
    expirationOffsetInDays: 730,
    group: 'staff',
    id: '3684a786-6671-4268-8ed0-9db82ebca60b'
  }],
  initialValues: {
    active: true,
    barcode: '1652666475582496124',
    createdDate: '2022-05-16T02:01:15.606+00:00',
    departments: [],
    id: '578a8413-dec9-4a70-a2ab-10ec865399f6',
    numberGeneratorData: { barcode: '' },
    patronGroup: '3684a786-6671-4268-8ed0-9db82ebca60b',
    permissions: [{}],
    personal: { lastName: 'Admin', firstName: 'acq-admin', addresses: [] },
    preferredServicePoint: 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
    proxies: [],
    proxyFor: [],
    requestPreferences: { holdShelf: true, delivery: false, defaultServicePointId: null, defaultDeliveryAddressTypeId: null },
    servicePoints: okapiCurrentUser.servicePoints,
    sponsors: [],
    expirationDate: '2022-05-16T02:01:15.606+00:00',
    type: 'patron',
    updatedDate: '2022-05-16T02:01:15.606+00:00',
    username: 'acq-admin'
  },
  intl: {},
  uniquenessValidator: {
    DELETE: jest.fn(),
    GET: jest.fn(),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
    reset: jest.fn()
  },
  profilePictureConfig: {
    enabled: true,
  },
};

describe('Render Edit User Information component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isConsortiumEnabled.mockClear().mockReturnValue(false);

    dayjs.mockImplementation(getDayjsMock);
    dayjs.tz = jest.fn(getDayjsMock);
    dayjs.utc = jest.fn(getDayjsMock);
  });

  it('Must be rendered', () => {
    renderEditUserInfo(props);
    expect(screen.getByText('ui-users.information.recalculate.will.reactivate.user')).toBeInTheDocument();
  });
  it('Change expiration date', async () => {
    renderEditUserInfo(props);
    await userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate'));
    expect(changeMock).toHaveBeenCalled();
  });

  describe('when "Reset" (recalculate) button is clicked', () => {
    it('should change expiration date', async () => {
      renderEditUserInfo(props);

      await act(() => userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate')));

      expect(changeMock).toHaveBeenCalledWith('expirationDate', '2027-05-04T03:59:59.999Z');
    });
  });

  it('should handle empty expiration date correctly', () => {
    renderEditUserInfo({
      ...props,
      initialValues: {
        ...props.initialValues,
        expirationDate: '',
      }
    });
    expect(screen.getByLabelText('ui-users.expirationDate')).not.toHaveValue();
  });
  it('Confirm click must change form values', async () => {
    renderEditUserInfo(props);
    await userEvent.type(document.querySelector('[id="adduser_lastname"]'), 'Sivavel');
    await userEvent.click(screen.getByText('ui-users.information.recalculate.modal.button'));
    expect(changeMock).toHaveBeenCalled();
  });
  it('Cancel click must not show modal', async () => {
    renderEditUserInfo(props);
    await userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate'));
    await userEvent.click(screen.getByText('ui-users.cancel'));
    expect(screen.getByText('ui-users.information.recalculate.expirationDate'));
  });

  it.each`
   type
    ${USER_TYPES.PATRON}
    ${USER_TYPES.SHADOW}
    ${USER_TYPES.SYSTEM}
  `('Should have user type $type', async ({ type }) => {
    const isShadowUser = type === USER_TYPES.SHADOW;
    const isSystemUser = type === USER_TYPES.SYSTEM;
    const isUserTypeDisabled = isShadowUser || isSystemUser;
    isConsortiumEnabled.mockClear().mockReturnValue(isShadowUser);
    renderEditUserInfo({ ...props, initialValues: { ...props.initialValues, type } });

    const selectElement = screen.getByRole('combobox', { name: /ui-users.information.userType/i });
    expect(selectElement).toBeInTheDocument();

    if (!isUserTypeDisabled) {
      expect(selectElement).toBeEnabled();
    }

    if (isUserTypeDisabled) {
      expect(selectElement).toBeDisabled();
    }
    expect(screen.getByRole('option', { name: `ui-users.information.userType.${type}` })).toHaveValue(type);
  });

  it('should have disabled fields with disabled prop is true', () => {
    renderEditUserInfo({ ...props, disabled: true });

    expect(screen.getByRole('textbox', { name: /lastName/ })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /firstName/ })).toBeDisabled();
  });

  it('should display profile picture', () => {
    renderEditUserInfo(props);
    expect(screen.getByText('Profile Picture')).toBeInTheDocument();
  });

  it('should not change user type onClick `Cancel` button', async () => {
    isConsortiumEnabled.mockClear().mockReturnValue(true);
    renderEditUserInfo({
      ...props,
      initialValues: {
        ...props.initialValues,
        type: USER_TYPES.STAFF,
      },
    });

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'ui-users.information.userType' }), USER_TYPES.PATRON);

    const option = screen.getByRole('option', { name: 'ui-users.information.userType.patron' });


    await userEvent.click(option);

    await screen.findByText('ChangeUserTypeModal');

    const cancelButton = screen.getByText('Cancel');

    await userEvent.click(cancelButton);
    expect(changeMock).toHaveBeenCalledWith('type', USER_TYPES.STAFF);
  });

  it('should enable barcode field and not render the NumberGeneratorModalButton when setting option=off', async () => {
    renderEditUserInfo({
      ...props,
      numberGeneratorData: { barcode: NUMBER_GENERATOR_OPTIONS_OFF },
    });

    expect(screen.getByRole('textbox', { name: 'ui-users.information.barcode' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'NumberGeneratorModalButton' })).not.toBeInTheDocument();
  });

  it('should enable barcode field and render the NumberGeneratorModalButton when setting option=onEditable', async () => {
    renderEditUserInfo({
      ...props,
      numberGeneratorData: { barcode: NUMBER_GENERATOR_OPTIONS_ON_EDITABLE },
    });

    expect(screen.getByRole('textbox', { name: 'ui-users.information.barcode' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'NumberGeneratorModalButton' })).toBeInTheDocument();
  });

  it('should disable barcode field and render the NumberGeneratorModalButton when setting option=onNotEditable', async () => {
    renderEditUserInfo({
      ...props,
      numberGeneratorData: { barcode: NUMBER_GENERATOR_OPTIONS_ON_NOT_EDITABLE },
    });

    expect(screen.getByRole('textbox', { name: 'ui-users.information.barcode' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'NumberGeneratorModalButton' })).toBeInTheDocument();
  });

  describe('when profilePicture configuration is not enabled', () => {
    it('should not render profile picture', () => {
      renderEditUserInfo({ ...props, profilePictureConfig: { enabled: false } });
      expect(screen.queryByText('Profile Picture')).not.toBeInTheDocument();
    });
  });

  describe('when user is of type shadow', () => {
    it('should not display profile picture', () => {
      const alteredProps = {
        ...props,
        initialValues: {
          ...props.initialValues,
          type: 'shadow',
        }
      };
      renderEditUserInfo(alteredProps);
      expect(screen.queryByText('Profile Picture')).not.toBeInTheDocument();
    });
  });

  describe('parseExpirationDate', () => {
    describe('when recalculating expiration date by hitting the "Reset" button', () => {
      it('should convert dates to UTC end-of-day ', async () => {
        const mockUtcDayjs = {
          ...getDayjsMock(),
          endOf: jest.fn().mockReturnThis(),
          toISOString: jest.fn().mockReturnValue('2025-07-31T23:59:59.999Z')
        };

        dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);

        renderEditUserInfo(props);

        await act(() => userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate')));
        await userEvent.click(screen.getByText('ui-users.information.recalculate.modal.button'));

        expect(dayjs.utc).toHaveBeenCalled();
        expect(mockUtcDayjs.endOf).toHaveBeenCalledWith('day');
        expect(mockUtcDayjs.toISOString).toHaveBeenCalled();
      });

      it('should process recalculated dates with correct format', async () => {
        const mockCalculatedDate = {
          ...getDayjsMock(),
          format: jest.fn().mockReturnValue('2025-07-31'),
          endOf: jest.fn().mockReturnThis(),
          isSameOrBefore: jest.fn().mockReturnValue(false),
        };

        const mockUtcDayjs = {
          ...getDayjsMock(),
          endOf: jest.fn().mockReturnThis(),
          toISOString: jest.fn().mockReturnValue('2025-07-31T23:59:59.999Z')
        };

        dayjs.mockImplementation(() => mockCalculatedDate);
        dayjs.tz = jest.fn().mockReturnValue(mockCalculatedDate);
        dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);

        renderEditUserInfo(props);

        await act(() => userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate')));
        await userEvent.click(screen.getByText('ui-users.information.recalculate.modal.button'));

        expect(mockCalculatedDate.format).toHaveBeenCalledWith('YYYY-MM-DD');
        expect(dayjs.utc).toHaveBeenCalledWith('2025-07-31');
        expect(mockUtcDayjs.endOf).toHaveBeenCalledWith('day');
        expect(changeMock).toHaveBeenCalledWith('expirationDate', '2025-07-31T23:59:59.999Z');
      });
    });
  });

  describe('getNowAndExpirationEndOfDayInTenantTz', () => {
    it('should handle timezone-aware expiration comparison for expired users', () => {
      const expiredDate = '2023-01-15T23:59:59.999Z';

      const mockUtcDayjs = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2023-01-15')
      };

      const mockExpirationEndOfDay = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(true),
        isAfter: jest.fn().mockReturnValue(false),
        endOf: jest.fn().mockReturnThis()
      };

      const mockNowInTz = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(false),
        isAfter: jest.fn().mockReturnValue(true)
      };

      const mockDayjsBase = {
        ...getDayjsMock(),
        tz: jest.fn().mockReturnValue(mockNowInTz)
      };

      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);
      dayjs.tz = jest.fn().mockReturnValue(mockExpirationEndOfDay);
      dayjs.mockReturnValue(mockDayjsBase);

      const propsWithExpiredUser = {
        ...props,
        initialValues: {
          ...props.initialValues,
          expirationDate: expiredDate,
        }
      };

      renderEditUserInfo(propsWithExpiredUser);

      expect(dayjs.utc).toHaveBeenCalledWith(expiredDate);
      expect(mockUtcDayjs.format).toHaveBeenCalledWith('YYYY-MM-DD');
      expect(dayjs.tz).toHaveBeenCalledWith('2023-01-15', 'America/New_York');
      expect(screen.getByText('ui-users.errors.userExpired')).toBeInTheDocument();
    });

    it('should handle timezone-aware expiration comparison for active users', () => {
      const futureDate = '2026-12-31T23:59:59.999Z';

      const mockUtcDayjs = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2026-12-31')
      };

      const mockExpirationEndOfDay = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(false),
        isAfter: jest.fn().mockReturnValue(true),
        endOf: jest.fn().mockReturnThis()
      };

      const mockNowInTz = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(true),
        isAfter: jest.fn().mockReturnValue(false)
      };

      const mockDayjsBase = {
        ...getDayjsMock(),
        tz: jest.fn().mockReturnValue(mockNowInTz)
      };

      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);
      dayjs.tz = jest.fn().mockReturnValue(mockExpirationEndOfDay);
      dayjs.mockReturnValue(mockDayjsBase);

      const propsWithActiveUser = {
        ...props,
        initialValues: {
          ...props.initialValues,
          expirationDate: futureDate,
        }
      };

      renderEditUserInfo(propsWithActiveUser);

      expect(dayjs.utc).toHaveBeenCalledWith(futureDate);
      expect(mockUtcDayjs.format).toHaveBeenCalledWith('YYYY-MM-DD');
      expect(dayjs.tz).toHaveBeenCalledWith('2026-12-31', 'America/New_York');
      expect(screen.queryByText('ui-users.errors.userExpired')).not.toBeInTheDocument();
    });

    it('should use tenant timezone', () => {
      const timezone = 'America/Vancouver';

      const mockUtcDayjs = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2025-07-15')
      };

      const mockTimezoneObj = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(false),
        isAfter: jest.fn().mockReturnValue(true),
        endOf: jest.fn().mockReturnThis()
      };

      const mockNowInTz = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(false),
        isAfter: jest.fn().mockReturnValue(true)
      };

      const mockDayjsBase = {
        ...getDayjsMock(),
        tz: jest.fn().mockReturnValue(mockNowInTz)
      };

      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);
      dayjs.tz = jest.fn().mockReturnValue(mockTimezoneObj);
      dayjs.mockReturnValue(mockDayjsBase);

      const timezoneProps = {
        ...props,
        stripes: {
          ...props.stripes,
          timezone
        },
        initialValues: {
          ...props.initialValues,
          expirationDate: '2025-07-15T23:59:59.999Z'
        }
      };

      renderEditUserInfo(timezoneProps);

      expect(dayjs.tz).toHaveBeenCalledWith('2025-07-15', timezone);
      expect(mockDayjsBase.tz).toHaveBeenCalledWith(timezone);
    });

    it('should extract date part correctly to avoid time inconsistencies', () => {
      // Test with old data that might not be end-of-day
      const inconsistentTimeData = '2025-06-15T14:30:22.123Z';

      const mockUtcDayjs = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2025-06-15')
      };

      const mockTimezoneObj = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(false),
        isAfter: jest.fn().mockReturnValue(true),
        endOf: jest.fn().mockReturnThis()
      };

      const mockNowInTz = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(false),
        isAfter: jest.fn().mockReturnValue(true)
      };

      const mockDayjsBase = {
        ...getDayjsMock(),
        tz: jest.fn().mockReturnValue(mockNowInTz)
      };

      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);
      dayjs.tz = jest.fn().mockReturnValue(mockTimezoneObj);
      dayjs.mockReturnValue(mockDayjsBase);

      const propsWithInconsistentTime = {
        ...props,
        initialValues: {
          ...props.initialValues,
          expirationDate: inconsistentTimeData,
        }
      };

      renderEditUserInfo(propsWithInconsistentTime);

      expect(dayjs.utc).toHaveBeenCalledWith(inconsistentTimeData);
      expect(mockUtcDayjs.format).toHaveBeenCalledWith('YYYY-MM-DD');
      expect(dayjs.tz).toHaveBeenCalledWith('2025-06-15', 'America/New_York');
      expect(mockTimezoneObj.endOf).toHaveBeenCalledWith('day');
    });

    it('should handle UTC fallback when timezone is not specified', () => {
      const mockUtcDayjs = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2025-08-01')
      };

      const mockTimezoneObj = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(false),
        isAfter: jest.fn().mockReturnValue(true),
        endOf: jest.fn().mockReturnThis()
      };

      const mockNowInTz = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(false),
        isAfter: jest.fn().mockReturnValue(true)
      };

      const mockDayjsBase = {
        ...getDayjsMock(),
        tz: jest.fn().mockReturnValue(mockNowInTz)
      };

      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);
      dayjs.tz = jest.fn().mockReturnValue(mockTimezoneObj);
      dayjs.mockReturnValue(mockDayjsBase);

      const propsWithoutTimezone = {
        ...props,
        stripes: {
          ...props.stripes,
          timezone: undefined,
        },
        initialValues: {
          ...props.initialValues,
          expirationDate: '2025-08-01T23:59:59.999Z'
        }
      };

      renderEditUserInfo(propsWithoutTimezone);

      expect(dayjs.tz).toHaveBeenCalledWith('2025-08-01', 'UTC');
      expect(mockDayjsBase.tz).toHaveBeenCalledWith('UTC');
    });

    it('should handle form field expiration date changes for willUserExtend logic', async () => {
      const futureDate = '2026-01-01T23:59:59.999Z';
      const expiredInitialDate = '2023-01-01T23:59:59.999Z';

      const mockUtcDayjsForInitial = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2023-01-01'),
      };

      const mockUtcDayjsForFuture = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2026-01-01'),
      };

      const mockExpiredEndOfDay = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(true),
        isAfter: jest.fn().mockReturnValue(false),
        endOf: jest.fn().mockReturnThis()
      };

      const mockFutureEndOfDay = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(false),
        isAfter: jest.fn().mockReturnValue(true),
        endOf: jest.fn().mockReturnThis()
      };

      const mockNowInTz = {
        ...getDayjsMock(),
        isBefore: jest.fn().mockReturnValue(true),
        isAfter: jest.fn().mockReturnValue(false)
      };

      const mockForm = {
        ...props.form,
        getFieldState: jest.fn().mockReturnValue({ value: futureDate })
      };

      const mockDayjsBase = {
        ...getDayjsMock(),
        tz: jest.fn().mockReturnValue(mockNowInTz)
      };

      dayjs.utc = jest.fn()
        .mockImplementation((date) => {
          if (date === expiredInitialDate) return mockUtcDayjsForInitial;
          if (date === futureDate) return mockUtcDayjsForFuture;
          return mockUtcDayjsForInitial;
        });

      dayjs.tz = jest.fn()
        .mockImplementation((date) => {
          if (date === '2023-01-01') return mockExpiredEndOfDay;
          if (date === '2026-01-01') return mockFutureEndOfDay;
          return mockExpiredEndOfDay;
        });

      dayjs.mockReturnValue(mockDayjsBase);

      const propsWithExtendingUser = {
        ...props,
        form: mockForm,
        initialValues: {
          ...props.initialValues,
          expirationDate: expiredInitialDate,
        }
      };

      renderEditUserInfo(propsWithExtendingUser);

      expect(screen.getByText('ui-users.information.recalculate.will.reactivate.user')).toBeInTheDocument();
      expect(mockForm.getFieldState).toHaveBeenCalledWith('expirationDate');
    });
  });

  describe('calculateNewExpirationDate', () => {
    it('should calculate from today when startCalcToday is true', async () => {
      const mockCalculatedDate = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2025-08-05'),
        add: jest.fn().mockReturnThis(),
        tz: jest.fn().mockReturnThis(),
        isSameOrBefore: jest.fn().mockReturnValue(false),
      };

      const mockUtcDayjs = {
        ...getDayjsMock(),
        endOf: jest.fn().mockReturnThis(),
        toISOString: jest.fn().mockReturnValue('2025-08-05T23:59:59.999Z')
      };

      dayjs.mockImplementation(() => mockCalculatedDate);
      dayjs.tz = jest.fn().mockReturnValue(mockCalculatedDate);
      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);

      renderEditUserInfo(props);

      await act(() => userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate')));
      await userEvent.click(screen.getByText('ui-users.information.recalculate.modal.button'));

      expect(dayjs().tz).toHaveBeenCalledWith('America/New_York');
      expect(mockCalculatedDate.add).toHaveBeenCalledWith(730, 'd');
      expect(mockCalculatedDate.format).toHaveBeenCalledWith('YYYY-MM-DD');
    });

    it('should calculate from existing expiration date when startCalcToday is false and date is in future', async () => {
      const futureDate = '2026-01-01T23:59:59.999Z';

      const mockExistingDate = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2026-01-01'),
        add: jest.fn().mockReturnThis(),
        tz: jest.fn().mockReturnThis(),
        isSameOrBefore: jest.fn().mockReturnValue(false),
      };

      const mockNowDate = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2025-08-05'),
        add: jest.fn().mockReturnThis(),
        tz: jest.fn().mockReturnThis(),
        isSameOrBefore: jest.fn().mockReturnValue(true),
      };

      const mockUtcDayjs = {
        ...getDayjsMock(),
        endOf: jest.fn().mockReturnThis(),
        toISOString: jest.fn().mockReturnValue('2026-01-01T23:59:59.999Z')
      };

      dayjs.mockImplementation(() => mockNowDate);
      dayjs.tz = jest.fn()
        .mockReturnValueOnce(mockExistingDate)
        .mockReturnValue(mockExistingDate);
      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);

      const propsWithFutureDate = {
        ...props,
        initialValues: {
          ...props.initialValues,
          expirationDate: futureDate,
        }
      };

      renderEditUserInfo(propsWithFutureDate);

      await userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate'));

      expect(dayjs.tz).toHaveBeenCalledWith(futureDate, 'America/New_York');
      expect(mockExistingDate.add).toHaveBeenCalledWith(730, 'd');
    });

    it('should fallback to today when existing expiration date is expired', async () => {
      const expiredDate = '2023-01-01T23:59:59.999Z';

      const mockExpiredDate = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2023-01-01'),
        add: jest.fn().mockReturnThis(),
        tz: jest.fn().mockReturnThis(),
        isSameOrBefore: jest.fn().mockReturnValue(true),
      };

      const mockNowDate = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2025-08-05'),
        add: jest.fn().mockReturnThis(),
        tz: jest.fn().mockReturnThis(),
        isSameOrBefore: jest.fn().mockReturnValue(false),
      };

      const mockUtcDayjs = {
        ...getDayjsMock(),
        endOf: jest.fn().mockReturnThis(),
        toISOString: jest.fn().mockReturnValue('2025-08-05T23:59:59.999Z')
      };

      dayjs.mockImplementation(() => mockNowDate);
      dayjs.tz = jest.fn()
        .mockReturnValueOnce(mockExpiredDate)
        .mockReturnValue(mockNowDate);
      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);

      const propsWithExpiredDate = {
        ...props,
        initialValues: {
          ...props.initialValues,
          expirationDate: expiredDate,
        }
      };

      renderEditUserInfo(propsWithExpiredDate);

      await userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate'));

      expect(mockNowDate.add).toHaveBeenCalledWith(730, 'd');
    });

    it('should handle undefined expiration date by using today', async () => {
      const mockNowDate = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2025-08-05'),
        add: jest.fn().mockReturnThis(),
        tz: jest.fn().mockReturnThis(),
        isSameOrBefore: jest.fn().mockReturnValue(false),
      };

      const mockUtcDayjs = {
        ...getDayjsMock(),
        endOf: jest.fn().mockReturnThis(),
        toISOString: jest.fn().mockReturnValue('2025-08-05T23:59:59.999Z')
      };

      dayjs.mockImplementation(() => mockNowDate);
      dayjs.tz = jest.fn().mockReturnValue(mockNowDate);
      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);

      const propsWithoutDate = {
        ...props,
        initialValues: {
          ...props.initialValues,
          expirationDate: undefined,
        }
      };

      renderEditUserInfo(propsWithoutDate);

      await userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate'));

      expect(mockNowDate.add).toHaveBeenCalledWith(730, 'd');
    });

    it('should use tenant timezone for calculations', async () => {
      const timezone = 'Asia/Tokyo';

      const mockCalculatedDate = {
        ...getDayjsMock(),
        format: jest.fn().mockReturnValue('2025-08-05'),
        add: jest.fn().mockReturnThis(),
        tz: jest.fn().mockReturnThis(),
        isSameOrBefore: jest.fn().mockReturnValue(false),
      };

      const mockUtcDayjs = {
        ...getDayjsMock(),
        endOf: jest.fn().mockReturnThis(),
        toISOString: jest.fn().mockReturnValue('2025-08-05T23:59:59.999Z')
      };

      dayjs.mockImplementation(() => mockCalculatedDate);
      dayjs.tz = jest.fn().mockReturnValue(mockCalculatedDate);
      dayjs.utc = jest.fn().mockReturnValue(mockUtcDayjs);

      const timezoneProps = {
        ...props,
        stripes: {
          ...props.stripes,
          timezone,
        },
      };

      renderEditUserInfo(timezoneProps);

      userEvent.click(screen.getByText('ui-users.information.recalculate.expirationDate'));

      expect(dayjs().tz).toHaveBeenCalledWith(timezone);
    });
  });
});
