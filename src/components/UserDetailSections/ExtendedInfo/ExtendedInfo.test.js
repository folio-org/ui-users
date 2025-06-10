
import {
  screen,
  within,
} from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import ExtendedInfo from './ExtendedInfo';

jest.unmock('@folio/stripes/components');

const mockUser = {
  id: 'user-id',
  enrollmentDate: '2022-01-01T00:00:00.000Z',
  externalSystemId: 'EXT-123',
  personal: {
    dateOfBirth: '1990-01-01T00:00:00.000Z',
  },
  username: 'testuser',
};

const mockRequestPreferences = {
  defaultServicePointId: 'sp-1',
  defaultDeliveryAddressTypeId: 'addr-1',
  fulfillment: 'Hold Shelf',
};

describe('ExtendedInfo', () => {
  const renderComponent = (props = {}) => {
    return renderWithRouter(
      <ExtendedInfo
        accordionId="extendedInfoAccordion"
        expanded
        onToggle={() => {}}
        user={mockUser}
        requestPreferences={mockRequestPreferences}
        defaultServicePointName="Main Library"
        defaultDeliveryAddressTypeName="Home Address"
        departments={['department-1', 'department-2']}
        userDepartments={['department-2']}
        {...props}
      />
    );
  };

  it('displays enrollment date when available', () => {
    renderComponent();
    expect(screen.getByText(/ui-users.extended.dateEnrolled/i)).toBeInTheDocument();
    expect(screen.getByText('2022-01-01T00:00:00.000Z')).toBeInTheDocument();
  });

  it('displays external system ID when available', () => {
    renderComponent();
    expect(screen.getByText(/ui-users.extended.externalSystemId/i)).toBeInTheDocument();
    expect(screen.getByText('EXT-123')).toBeInTheDocument();
  });

  it('displays birth date when available', () => {
    renderComponent();
    expect(screen.getByText(/ui-users.extended.birthDate/i)).toBeInTheDocument();
    expect(screen.getByText('1990-01-01T00:00:00.000Z')).toBeInTheDocument();
  });

  it('displays FOLIO number from user ID', () => {
    renderComponent();
    expect(screen.getByText(/ui-users.extended.folioNumber/i)).toBeInTheDocument();
    expect(screen.getByText('user-id')).toBeInTheDocument();
  });

  describe('RequestPreferencesView', () => {
    it('displays request preferences', () => {
      renderComponent();
      expect(screen.getByText('ui-users.requests.preferences')).toBeInTheDocument();
      expect(screen.getByText('ui-users.requests.holdShelf')).toBeInTheDocument();
      expect(screen.getByText('ui-users.requests.delivery')).toBeInTheDocument();
    });

    it('displays default service point', () => {
      renderComponent();
      expect(screen.getByText('ui-users.requests.defaultPickupServicePoint')).toBeInTheDocument();
      expect(screen.getByText('Main Library')).toBeInTheDocument();
    });

    it('displays fulfilment', () => {
      renderComponent();
      expect(screen.getByText('ui-users.requests.fulfillmentPreference')).toBeInTheDocument();
      expect(screen.getByText('Hold Shelf')).toBeInTheDocument();
    });

    it('displays default delivery address', () => {
      renderComponent();
      expect(screen.getByText('ui-users.requests.defaultDeliveryAddress')).toBeInTheDocument();
      expect(screen.getByText('Home Address')).toBeInTheDocument();
    });
  });

  describe('Departments', () => {
    describe('when there are departments in Settings', () => {
      describe('and there is a department selected in user data', () => {
        it('displays user departments', () => {
          renderComponent({
            departments: ['department-1', 'department-2'],
            userDepartments: ['department-1', 'department-2'],
          });

          expect(screen.getByText(/ui-users.extended.department.name/i)).toBeInTheDocument();
          expect(screen.getByText('department-1, department-2')).toBeInTheDocument();
        });
      });

      describe('and there are no departments selected in user data', () => {
        it('displays empty string for user departments', () => {
          renderComponent({
            departments: ['department-1', 'department-2'],
            userDepartments: [],
          });

          const departmentNames = screen.getByTestId('department-names');

          expect(screen.getByText(/ui-users.extended.department.name/i)).toBeInTheDocument();
          expect(within(departmentNames).getByText('stripes-components.noValue.noValueSet')).toBeInTheDocument();
        });
      });
    });

    describe('when there are no departments in Settings', () => {
      it('does not display departments section', () => {
        renderComponent({
          departments: [],
          userDepartments: [],
        });

        expect(screen.queryByText(/ui-users.extended.department.name/i)).not.toBeInTheDocument();
      });
    });
  });

  it('displays username when available', () => {
    renderComponent();
    expect(screen.getByText(/ui-users.information.username/i)).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });
});
