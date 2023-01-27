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
const setFieldValueMock = jest.fn();

const props = {
  deliveryAvailable: true,
  servicePoints: [
    {
      id: '1',
      name: 'Service point 1'
    },
    {
      id: '2',
      name: 'Service point 2'
    }
  ],
  addresses: [
    {
      addressType: 'addressType1'
    },
    {
      addressType: 'addressType2'
    }
  ],
  addressTypes: [
    {
      id: 'addressType1',
      addressType: 'Address 1'
    },
    {
      id: 'addressType2',
      addressType: 'Address 2'
    }
  ],
  setFieldValue: setFieldValueMock,
  defaultDeliveryAddressTypeId: 'addressType1'
};

const renderRequestPreferencesEdit = (data, options) => {
  const component = () => {
    return (
      <RequestPreferencesEdit {...data} />
    );
  };
  renderWithRouter(
    <Form
      id="form-user"
      onSubmit={onSubmit}
      render={component}
    />,
    options
  );
};
describe('request preference point', () => {
  it('Component should render', () => {
    renderRequestPreferencesEdit(props);
    expect(screen.getByRole('checkbox', { name: /ui-users.requests.holdShelf/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /ui-users.requests.delivery/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /ui-users.requests.defaultPickupServicePoint/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /ui-users.requests.fulfillmentPreference/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /ui-users.requests.defaultDeliveryAddress/i })).toBeInTheDocument();
  });

  it('setFieldValue to be called when on deliveryAvailable changed', () => {
    renderRequestPreferencesEdit(props);
    renderRequestPreferencesEdit({
      ...props,
      deliveryAvailable: false,
      addresses: [
        {
          addressType: 'addressType3'
        },
        {
          addressType: 'addressType4'
        }
      ],
      defaultDeliveryAddressTypeId: 'addressType1'
    }, { rerender: true });
    expect(setFieldValueMock).toBeCalled();
  });
  it('defaultPickupServicePoint value should be changed', () => {
    renderRequestPreferencesEdit(props);
    const dropDown = screen.getByRole('combobox', { name: /ui-users.requests.defaultPickupServicePoint/i });
    userEvent.selectOptions(dropDown, '1');
    expect(dropDown).toHaveDisplayValue('Service point 1');
  });
  it('defaultDeliveryAddress value should be changed', () => {
    renderRequestPreferencesEdit(props);
    const dropDown = screen.getByRole('combobox', { name: /ui-users.requests.defaultDeliveryAddress/i });
    userEvent.selectOptions(dropDown, 'addressType1');
    expect(dropDown).toHaveDisplayValue('Address 1');
  });
  it('Requests delivery checkbox should be checked', () => {
    renderRequestPreferencesEdit(props);
    const checkbox = screen.getByRole('checkbox', { name: /ui-users.requests.delivery/i });
    userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
