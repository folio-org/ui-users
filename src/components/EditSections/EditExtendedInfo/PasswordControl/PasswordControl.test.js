import React from 'react';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import {
  screen,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';

import renderWithRouter from 'helpers/renderWithRouter';

import PasswordControl from './PasswordControl';

import '__mock__/stripesSmartComponent.mock';

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

const renderPasswordControl = (props) => {
  const component = () => (
    <>
      <PasswordControl {...props} />
    </>
  );
  renderWithRouter(
    <Form
      id="pw"
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
  isRequired: true,
  toggleRequired: jest.fn(),
};

describe('PasswordControl component', () => {
  describe('render with props', () => {
    beforeEach(() => {
      renderPasswordControl(props);
    });
    afterEach(cleanup);

    it('Check if components Renders', () => {
      expect(screen.getByText('ui-users.show')).toBeInTheDocument();
      expect(screen.getByText('ui-users.extended.folioPassword')).toBeInTheDocument();
    });

    it('Checking togglePassword functionality', () => {
      userEvent.click(screen.getByText('ui-users.show'));

      expect(screen.getByText('ui-users.hide')).toBeInTheDocument();
    });
  });
});
