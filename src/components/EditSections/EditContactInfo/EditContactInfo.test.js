import { Form } from 'react-final-form';

import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import EditContactInfo from './EditContactInfo';
import '__mock__/matchMedia.mock';

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
  addressTypeId: '93e38b6f-f499-4812-b272-721d232838ab',
  intl: {
    formatMessage : jest.fn()
  },
  stripes: {
    hasInterface: jest.fn().mockReturnValue(true),
  },
};

describe('Render Edit contact Information component', () => {
  it('should render Address List', () => {
    renderEditContactInfo(props);
    expect(screen.getByText('AddressEditList')).toBeInTheDocument();
  });

  it('should render Preferred Email Communication field', () => {
    renderEditContactInfo(props);
    expect(screen.getAllByLabelText('ui-users.contact.preferredEmailCommunication')[0]).toBeInTheDocument();
  });

  it('should render email field', async () => {
    renderEditContactInfo(props);

    const emailInput = screen.getAllByRole('textbox', { name: /email/i })[0];

    await userEvent.type(emailInput, 'Test@gmail.com');
    expect(emailInput.value).toBe('Test@gmail.com');
  });

  it('should set Preferred Email Communication input field value on selection', async () => {
    renderEditContactInfo(props);
    const prefEmailCommInput = document.querySelector('[id="multi-value-status-adduserPreferredEmailCommunication"]');
    expect(prefEmailCommInput).toHaveTextContent('0 items selected');

    await userEvent.click(document.querySelector('[id="adduserPreferredEmailCommunication-main-item-1"]'));
    await userEvent.click(document.querySelector('[id="adduserPreferredEmailCommunication-main-item-2"]'));

    expect(prefEmailCommInput).toHaveTextContent('2 items selected');
  });

  it('should update Preferred Email Communication input field value on user input', async () => {
    renderEditContactInfo(props);
    const prefEmailCommInputField = document.querySelector('[id="adduserPreferredEmailCommunication-input"]');
    expect(prefEmailCommInputField).toHaveValue('');

    await userEvent.type(prefEmailCommInputField, 'Prog');
    expect(prefEmailCommInputField).toHaveValue('Prog');
  });

  it('should render with disabled fields', () => {
    renderEditContactInfo({ ...props, disabled: true });

    expect(screen.getAllByRole('textbox', { name: /email/i })[0]).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /mobilePhone/i })).toBeDisabled();
    expect(screen.getByLabelText('ui-users.contact.phone')).toBeDisabled();
    expect(document.querySelector('[id="adduserPreferredEmailCommunication-input"]')).toBeDisabled();
  });
});
