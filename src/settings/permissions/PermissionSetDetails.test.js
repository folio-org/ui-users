import { fireEvent } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import PermissionSetDetails from './PermissionSetDetails';


jest.unmock('@folio/stripes/components');

const renderPermissionSetDetails = (props) => renderWithRouter(<PermissionSetDetails {...props} />);
const STRIPES = {
  connect: (Component) => Component,
  config: {},
  currency: 'USD',
  hasInterface: () => true,
  hasPerm: jest.fn().mockReturnValue(true),
  locale: 'en-US',
  logger: {
    log: () => {},
  },
  okapi: {
    tenant: 'diku',
    url: 'https://folio-testing-okapi.dev.folio.org',
    translations: {
      'stripes-components.Datepicker.calendar': 'calendar',
      'stripes-components.Datepicker.calendarDaysList': 'calendar days list.',
      'stripes-core.button.cancel': [{ type: 0, value: 'Cancel' }],
      'ui-users.permission.modal.list.pane.header': 'Permissions',
      'ui-users.permission.modal.list.pane.header.array': [{ type: 0, value: 'Permissions' }],
      default: false,
    },
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
const props = {
  initialValues: {
    displayName: 'role-acq-admin',
    permissionName: 'role-acq-admin',
    id: 'e31c1598-d85a-423e-a401-2252f0f4fe71',
    grantedTo: ['d6629616-d85f-41c2-b172-8ea6cb6b7fc0', '8fafcfdb-419c-483e-a698-d7f8f46ea694'],
    subPermissions: [],
    visible: true,
    mutable: true,
    metadata: {
      createdByUserId: '61e6d812-8763-5467-b797-ce20c303badb',
      createdDate: '2021-11-22T03:38:19.279+00:00',
      updatedByUserId: '61e6d812-8763-5467-b797-ce20c303badb',
      updatedDate: '2021-11-22T03:38:19.279+00:00',
    }
  },
  intl: {},
  stripes: STRIPES,
};

describe('PermissionSetDetails component', () => {
  it('Component must be rendered', () => {
    renderPermissionSetDetails(props);
    expect(renderPermissionSetDetails(props)).toBeTruthy();
  });
  it('Checking expand all button', () => {
    renderPermissionSetDetails(props);
    fireEvent.click(document.querySelector('[data-tast-expand-button="true"]'));
    expect(renderPermissionSetDetails(props)).toBeTruthy();
  });
  it('Checking expand - general information', () => {
    renderPermissionSetDetails(props);
    fireEvent.click(document.querySelector('[id="accordion-toggle-button-generalInformation"]'));
    expect(renderPermissionSetDetails(props)).toBeTruthy();
  });
});
