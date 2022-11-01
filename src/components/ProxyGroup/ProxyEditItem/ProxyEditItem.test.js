import { screen } from '@testing-library/react';
import renderWithRouter from 'helpers/renderWithRouter';
import { Form } from 'react-final-form';
import userEvent from '@testing-library/user-event';
import user from 'fixtures/okapiCurrentUser';
import ProxyEditItem from './ProxyEditItem';


jest.unmock('@folio/stripes/components');

const onSubmit = jest.fn();

const renderProxyEditItem = (props) => {
  const component = () => (
    <>
      <ProxyEditItem {...props} />
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

const changeMock = jest.fn();
const deleteMock = jest.fn();

const props = () => {
  return {
    index: 0,
    record: {
      proxy : {
        id: 'test',
        name: 'test',
        expirationDate: '2021-11-23T09:53:48.906+00:00',
        metadata: {
          createdDate: '2021-11-23T09:53:48.906+00:00',
          createdByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27',
          updatedDate: '2021-11-23T09:53:48.906+00:00',
          updatedByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27'
        }
      },
      user,
    },
    namespace: 'sponsors',
    name: 'test',
    onDelete: deleteMock,
    change: changeMock,
    formValues: { sponsors : [{ status:'Active' }] }
  };
};

describe('Render ProxyEditItem', () => {
  it('Render ProxyEdit Item with expiration date', () => {
    renderProxyEditItem(props());
    expect(screen.getByText('ui-users.expirationDate')).toBeInTheDocument();
  });
  it('Check ProxyEdit Item for requestForSponsor', () => {
    renderProxyEditItem(props());
    expect(screen.getByText('ui-users.proxy.requestForSponsor')).toBeTruthy();
  });
  it('Checking delete function', () => {
    renderProxyEditItem(props());
    userEvent.click(screen.queryByText('Delete'));
    expect(deleteMock).toHaveBeenCalled();
  });
  it('Selecting Proxy options', () => {
    renderProxyEditItem(props());
    userEvent.selectOptions(document.querySelector('[name="test.proxy.status"]'), screen.getByText('ui-users.active'));
    expect(screen.getByText('ui-users.active')).toBeTruthy();
  });
  it('Changing expiration date', () => {
    renderProxyEditItem(props());
    userEvent.type(document.querySelector('[name="test.proxy.expirationDate"]'), '2022-10-31');
    expect(screen.getByText('ui-users.active')).toBeTruthy();
  });
});
