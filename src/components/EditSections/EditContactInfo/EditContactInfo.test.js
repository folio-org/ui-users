import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';

import '__mock__/stripesComponents.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import EditContactInfo from './EditContactInfo';

const onSubmit = jest.fn();

const arrayMutators = {
  concat: jest.fn(),
  move: jest.fn(),
  pop: jest.fn(),
  push: jest.fn(),
  remove: jest.fn(),
  removeBatch: jest.fn(),
  shift: jest.fn(),
  swap: jest.fn(),
  unshift: jest.fn(),
  update: jest.fn()
};

const renderEditContactInfo = (props) => {
  const component = () => (
    <>
      <EditContactInfo {...props} />
    </>
  );
  renderWithRouter(
    <Form
      id="form-user"
      mutators={{
        ...arrayMutators
      }}
      onSubmit={onSubmit}
      render={component}
    />
  );
};

const changeMock = jest.fn();

const props = {
  form: {
    change: changeMock,
    getFieldState: jest.fn(() => {
      return { value: '2022-08-16T02:01:15.606+00:00' };
    })
  },
  accordionId: 'EditContactInfo',
  expanded: true,
  onToggle: jest.fn(),
  addressTypes: [{
    addressType: 'Home',
    id: '123123'
  },
  {
    addressType: 'Work',
    id: '123123132'
  }],
  preferredContactTypeId: '001',
  intl: {
    formatMessage : jest.fn()
  }
};

describe('Render Edit contact Information component', () => {
  it('Must be rendered', () => {
    renderEditContactInfo(props);
    expect(screen.getByText('AddressEditList')).toBeInTheDocument();
  });
  it('Must be rendered', () => {
    renderEditContactInfo(props);
    userEvent.type(document.querySelector('[id="adduser_email"]'), 'Test@gmail.com');
    expect(document.querySelector('[id="adduser_email"]').value).toBe('Test@gmail.com');
  });
});
