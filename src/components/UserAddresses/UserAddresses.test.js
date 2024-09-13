import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import UserAddresses from './UserAddresses';

jest.unmock('@folio/stripes/components');

const updateMock = jest.fn();

const renderUserAddresses = (props) => renderWithRouter(<UserAddresses {...props} />);


const props = {
  onUpdate: updateMock,
  intl: {
    formatMessage: jest.fn(),
    formatDisplayName: jest.fn(),
  },
  expanded: false,
  editable: true,
  addressTypes: [{
    addressType: 'home',
    id: '123123'
  }],
  addresses: [{
    addressLine1: 'TestAddress',
    addressLine2: 'TestLine2',
    stateRegion: 'State',
    zipCode: '1',
    addressType: 'home',
    city: 'city',
    country: 'country'
  }]
};

describe('Render UserAddresses component', () => {
  it('Check if addresses are shown', () => {
    renderUserAddresses(props);
    expect(document.querySelector('[name="zipCode"]').value).toBe('1');
    expect(document.querySelector('[name="stateRegion"]').value).toBe('State');
  });
  it('Checking edit', async () => {
    renderUserAddresses(props);
    await userEvent.type(document.querySelector('[name="zipCode"]'), '1235');
    expect(document.querySelector('[name="zipCode"]').value).toBe('11235');
  });
  it('Checking edit save', async () => {
    renderUserAddresses(props);
    userEvent.type(document.querySelector('[name="zipCode"]'), '1235');
    await userEvent.click(screen.getByText('Save'));
    expect(updateMock).toHaveBeenCalled();
  });
  it('Checking Delete', async () => {
    renderUserAddresses(props);
    await userEvent.click(screen.getByText('Remove this address'));
    expect(updateMock).toHaveBeenCalled();
  });
  it('empty address', () => {
    const prop = {
      onUpdate: updateMock,
      intl: {
        formatMessage: jest.fn(),
      },
      expanded: false,
      editable: true,
      addressTypes: [],
      addresses: []
    };
    renderUserAddresses(prop);
    expect(screen.getByText('stripes-components.addNew')).toBeInTheDocument();
  });
});
