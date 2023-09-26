import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { Form } from 'react-final-form';

import '__mock__/stripesComponents.mock';

import renderWithRouter from 'helpers/renderWithRouter';

import EditUserInfo from './EditUserInfo';
import { isConsortiumEnabled } from '../../util';
import { USER_TYPES } from '../../../constants';

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
    hasInterface: () => true,
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
  }
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
});
