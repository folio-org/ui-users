import { screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import userEvent from '@testing-library/user-event';
import renderWithRouter from 'helpers/renderWithRouter';

import '__mock__/stripesComponents.mock';

import RequestPreferencesEdit from './RequestPreferencesEdit';

jest.mock('react-redux', () => ({
  connect: () => (ReactComponent) => ReactComponent,
}));
jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const onSubmit = jest.fn();
const setFieldMock = jest.fn();

const renderRequestPreferencesEdit = (props) => {
  const component = () => (
    <>
      <RequestPreferencesEdit {...props} />
    </>
  );
  renderWithRouter(
    <Form
      id="form-user"
      onSubmit={onSubmit}
      render={component}
    />
  );
};


const props = {
  accordionId: 'EditContactInfo',
  expanded: true,
  onToggle: jest.fn(),
  setFieldValue: setFieldMock,
  deliveryAvailable: true,
  intl: { formatMessage : jest.fn() },
  servicePoints: [
    {
      name: 'servicePointsName',
      id: 'd003c876-90f1-40da-90bc-a5dd3dedb9c6a',
      name2: 'servicenameDefault',
      id2: ''
    }

  ],
  addresses: [{
    addressType: 'Industrial Zone'
  }],
  addressTypes: [{
    addressType: 'Home',
    id: '123123'
  },
  {
    addressType: 'Work',
    id: '123123132'
  }],
  id: '111999',
  name: 'servicePointPickUp'

};


describe('request preference point', () => {
  it('Must be rendered request preferences', () => {
    renderRequestPreferencesEdit(props);
    expect(screen.getByText('ui-users.requests.preferences')).toBeTruthy();
  });

  it('Must be rendered', () => {
    renderRequestPreferencesEdit(props);
    expect(screen.getByText('ui-users.requests.selectDeliveryAddress')).toBeInTheDocument();
    expect(screen.getByText('ui-users.requests.defaultDeliveryAddress')).toBeInTheDocument();
  });

  it('Must be rendered request null value', () => {
    renderRequestPreferencesEdit(props);
    expect(document.querySelector('ui-users.errors.missingRequiredField')).toBeNull();
  });

  it('Checkbox selection', async () => {
    renderRequestPreferencesEdit(props);
    userEvent.click(document.querySelector('[name="requestPreferences.holdShelf"]'));
    userEvent.selectOptions(document.querySelector('[data-test-fulfillment-preference="true"]'), 'Hold Shelf');
    expect(screen.findByDisplayValue('Hold Shelf')).toBeTruthy();
  });

  it('Service PointsWith Pickup Location', () => {
    renderRequestPreferencesEdit(props);
    expect(screen.findByLabelText('folio_users_service_points.records"')).toBeTruthy();
  });
});
