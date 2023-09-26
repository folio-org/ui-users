import { Form } from 'react-final-form';

import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import EditContactInfo from './EditContactInfo';

jest.unmock('@folio/stripes/components');

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

  return renderWithRouter(
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

  it('Must be rendered', async () => {
    renderEditContactInfo(props);

    const emailInput = screen.getByRole('textbox', { name: /email/i });

    await userEvent.type(emailInput, 'Test@gmail.com');
    expect(emailInput.value).toBe('Test@gmail.com');
  });

  it('should render with disabled fields', () => {
    renderEditContactInfo({ ...props, disabled: true });

    expect(screen.getByRole('textbox', { name: /email/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /mobilePhone/i })).toBeDisabled();
    expect(screen.getByLabelText('ui-users.contact.phone')).toBeDisabled();
  });
});
