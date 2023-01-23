import React from 'react';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import renderWithRouter from '../../../../test/jest/helpers/renderWithRouter';

import ProxyEditItem from './ProxyEditItem';

jest.unmock('@folio/stripes/components');

const changeMock = jest.fn();
const deleteMock = jest.fn();
const onSubmit = jest.fn();
const props = {
  name: 'test',
  record: {
    user: {
      id: '123',
      name: 'test'
    },
    proxy: {
      status: 'Active',
      expirationDate: '2022-11-30',
      requestForSponsor: 'No',
      notificationsTo: 'Sponsor',
      metadata: {
        createdDate: '2021-11-23',
        createdByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27',
        updatedDate: '2021-11-23',
        updatedByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27'
      }
    }
  },
  index: 0,
  namespace: 'sponsors',
  onDelete: deleteMock,
  change: changeMock,
  formValues: {
    sponsors: [
      {
        proxy: {
          status: 'Active',
          expirationDate: '2022-11-30',
          requestForSponsor: 'No',
          notificationsTo: 'Sponsor'
        }
      }
    ]
  }
};
const renderProxyEditItem = (data) => {
  const component = () => {
    return (
      <ProxyEditItem {...data} />
    );
  };
  renderWithRouter(
    <Form
      id="form-user"
      onSubmit={onSubmit}
      render={component}
    />
  );
};
describe('ProxyEditItem', () => {
  it('Component should render', () => {
    act(() => {
      renderProxyEditItem(props);
    });
    const expirationDate = screen.getByRole('textbox', { name: /ui-users.expirationDate/i });
    userEvent.clear(expirationDate);
    userEvent.type(expirationDate, '2023-11-30');
    expect(screen.getByRole('textbox', { name: /ui-users.expirationDate/i })).toHaveDisplayValue('2023-11-30');
  });
});
