import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { Form } from 'react-final-form';

import '__mock__/stripesComponents.mock';

import { NumberGeneratorModalButton as MockNGMB } from '@folio/service-interaction';

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

jest.mock('../../ConditionalLoad/ConditionalLoad', () => ({
  children,
  importString,
  importSuccess
}) => {
  const theImport = jest.requireMock(importString);
  const Component = importSuccess(theImport).default; // Little bit hacky but it does the job
  return (
    <>
      {children({ Component })}
    </>
  );
});

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
    timezone: 'USA/TestTimeZone',
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
    isConsortiumEnabled.mockClear().mockReturnValue(false);
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
});
