import React from 'react';
import { screen, fireEvent } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
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
        createdDate: '2021-11-23T09:53:48.906+00:00',
        createdByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27',
        updatedDate: '2021-11-23T09:53:48.906+00:00',
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
          notificationsTo: 'Sponsor',
        }
      }
    ]
  },
  meta: {
    data: {
      warning: 'No warning'
    }
  }
};
const renderProxyEditItem = (data, options) => {
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
    />,
    options
  );
};

jest.useFakeTimers();

describe('ProxyEditItem', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('Component should render ', () => {
    renderProxyEditItem(props);
    expect(screen.getByRole('combobox', { name: /ui-users.proxy.requestForSponsor/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /ui-users.proxy.relationshipStatus/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /ui-users.proxy.notificationsTo/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /ui-users.expirationDate/i })).toBeInTheDocument();
  });

  it('updateStatus to be called', () => {
    renderProxyEditItem(props);
    const expirationDate = screen.getByRole('textbox', { name: /ui-users.expirationDate/i });

    userEvent.clear(expirationDate);
    userEvent.type(expirationDate, '2023-11-30');

    jest.advanceTimersByTime(100);

    expect(changeMock).toBeCalled();
  });

  it('updateStatus to be called when props data is updated', () => {
    renderProxyEditItem(props);
    renderProxyEditItem({
      ...props,
      formValues: {
        sponsors: [
          {
            proxy: {
              status: 'Active',
              expirationDate: '2024-12-30',
              requestForSponsor: 'No',
              notificationsTo: 'Sponsor'
            }
          }
        ]
      },
    }, { rerender: true });
    expect(changeMock).toBeCalled();
  });

  it('onDelete to be called ', () => {
    renderProxyEditItem(props);
    const button = screen.getByRole('button', { name: 'Icon (trash) Delete' });
    fireEvent.click(button);

    expect(deleteMock).toBeCalled();
  });

  it('should not crash when the item at the current index was absent in previous formValues', () => {
    // Simulate the scenario where a new item is unshifted into the array:
    // the existing component (now at index=1) receives prevFormValues that
    // only had data at index=0, so prevFormValues[namespace][1] is undefined.
    const propsAtNewIndex = {
      ...props,
      index: 1,
      record: {
        user: { id: '456', name: 'second user' },
        proxy: {
          status: 'Active',
          expirationDate: '2025-01-01',
          requestForSponsor: 'Yes',
          notificationsTo: 'Proxy',
          metadata: {},
        },
      },
      formValues: {
        sponsors: [
          {
            user: { id: '123' },
            proxy: { status: 'Active', expirationDate: '2022-11-30', requestForSponsor: 'No', notificationsTo: 'Sponsor' },
          },
        ],
      },
    };

    renderProxyEditItem(propsAtNewIndex);

    expect(() => renderProxyEditItem({
      ...propsAtNewIndex,
      formValues: {
        sponsors: [
          {
            user: { id: '789' },
            proxy: { status: 'Active', expirationDate: '2022-11-30', requestForSponsor: 'No', notificationsTo: 'Sponsor' },
          },
          {
            user: { id: '456' },
            proxy: { status: 'Active', expirationDate: '2025-01-01', requestForSponsor: 'Yes', notificationsTo: 'Proxy' },
          },
        ],
      },
    }, { rerender: true })).not.toThrow();
  });

  it('should calls updateStatus when the current user expirationDate changes', () => {
    renderProxyEditItem(props);
    jest.advanceTimersByTime(100);
    jest.clearAllMocks();

    renderProxyEditItem({
      ...props,
      formValues: {
        ...props.formValues,
        expirationDate: '2030-12-31',
      },
    }, { rerender: true });

    expect(changeMock).toHaveBeenCalled();
  });

  it('should not call updateStatus when unrelated formValues fields change', () => {
    renderProxyEditItem(props);
    jest.advanceTimersByTime(100);
    jest.clearAllMocks();

    renderProxyEditItem({
      ...props,
      formValues: {
        ...props.formValues,
        someUnrelatedField: 'changed',
      },
    }, { rerender: true });

    expect(changeMock).not.toHaveBeenCalled();
  });
});
