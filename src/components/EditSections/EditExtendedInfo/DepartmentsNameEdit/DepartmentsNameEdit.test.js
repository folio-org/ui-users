import React from 'react';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import { Form } from 'react-final-form';
import {
  screen,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderWithRouter from 'helpers/renderWithRouter';
import DepartmentsNameEdit from './DepartmentsNameEdit';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const onSubmit = jest.fn();

const arrayMutators = {
  pop: jest.fn(),
  push: jest.fn(),
};

const renderDepartmentsNameEdit = (props) => {
  const component = () => (
    <DepartmentsNameEdit {...props} />
  );
  renderWithRouter(
    <Form
      id="form-user"
      mutators={{
        ...arrayMutators
      }}
      initialValues={{
        servicePoints: okapiCurrentUser.servicePoints,
      }}
      onSubmit={onSubmit}
      render={component}
    />
  );
};

const props = {
  departments : [
    { id: 'id', code: 'code', name: 'test' },
  ],
};

describe('Given DepartmentsNameEdit', () => {
  beforeEach(() => {
    renderDepartmentsNameEdit(props);
  });
  afterEach(cleanup);

  it('should render "Department name"', () => {
    expect(screen.getByText('ui-users.extended.department.name')).toBeInTheDocument();
  });

  it('should render "Add Department" button', () => {
    expect(screen.getByText('ui-users.extended.department.add')).toBeInTheDocument();
  });

  it('should render select component after clicking "Add Department" button', () => {
    userEvent.click(screen.getByText('ui-users.extended.department.add'));
    expect(screen.queryByPlaceholderText(/ui-users.extended.department.default/i));
  });
});
