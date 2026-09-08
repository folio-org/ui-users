import React from 'react';
import { screen } from '@folio/jest-config-stripes/testing-library/react';
import { Form } from 'react-final-form';
import renderWithRouter from '../../../../test/jest/helpers/renderWithRouter';
import ProxyEditList from './ProxyEditList';

jest.unmock('@folio/stripes/components');

// Prefixed with `mock` so Jest's mock factory scope restriction allows access.
let mockFieldsValue = [];

jest.mock('react-final-form-arrays', () => ({
  FieldArray: ({ component }) => {
    const fields = {
      value: mockFieldsValue,
      map: (fn) => mockFieldsValue.map((_, i) => fn(`proxies[${i}]`, i)),
      unshift: jest.fn(),
      remove: jest.fn(),
    };
    return component({ fields });
  },
}));

const onSubmit = jest.fn();

const MockItemComponent = ({ record, index }) => (
  <div data-testid={`proxy-item-${index}`} data-userid={record?.user?.id ?? 'none'}>
    {record?.user?.id ?? `item-${index}`}
  </div>
);

const baseInitialValues = {
  id: 'current-user-id',
  proxies: [],
};

const renderProxyEditList = (initialValues = baseInitialValues, options) => {
  const component = () => (
    <ProxyEditList
      name="proxies"
      label="Proxies"
      itemComponent={MockItemComponent}
    />
  );
  return renderWithRouter(
    <Form
      id="form-user"
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={component}
    />,
    options
  );
};

describe('ProxyEditList', () => {
  beforeEach(() => {
    mockFieldsValue = [];
  });

  it('should renders without crashing when the list is empty', () => {
    renderProxyEditList();
    expect(screen.getByText(/ui-users.noItemFound/i)).toBeInTheDocument();
  });

  it('should renders a single item using user.id as the React key', () => {
    mockFieldsValue = [
      {
        user: { id: 'user-001', firstName: 'Alice', lastName: 'Smith' },
        proxy: { status: 'Active' },
      },
    ];
    renderProxyEditList();

    const item = screen.getByTestId('proxy-item-0');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-userid', 'user-001');
  });

  it('should renders multiple items each using their own user.id as the React key', () => {
    mockFieldsValue = [
      {
        user: { id: 'user-001', firstName: 'Alice', lastName: 'Smith' },
        proxy: { status: 'Active' },
      },
      {
        user: { id: 'user-002', firstName: 'Bob', lastName: 'Jones' },
        proxy: { status: 'Active' },
      },
    ];
    renderProxyEditList();

    expect(screen.getByTestId('proxy-item-0')).toHaveAttribute('data-userid', 'user-001');
    expect(screen.getByTestId('proxy-item-1')).toHaveAttribute('data-userid', 'user-002');
  });

  it('should falls back to index-based key when user.id is absent', () => {
    mockFieldsValue = [
      {
        user: {},
        proxy: { status: 'Active' },
      },
    ];
    renderProxyEditList();

    const item = screen.getByTestId('proxy-item-0');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-userid', 'none');
  });
});
