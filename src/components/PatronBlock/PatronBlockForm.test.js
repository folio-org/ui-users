import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import React from 'react';
import {
  screen,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderWithRouter from 'helpers/renderWithRouter';
import PatronBlockForm from './PatronBlockForm';
import '__mock__/matchMedia.mock';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderPatronBlockForm = (props) => renderWithRouter(<PatronBlockForm {...props} />);

const STRIPES = {
  connect: (Component) => Component,
  config: {},
  currency: 'USD',
  hasInterface: () => true,
  hasPerm: jest.fn().mockReturnValue(true),
  clone: jest.fn(),
  setToken: jest.fn(),
  locale: 'en-US',
  logger: {
    log: () => {},
  },
  okapi: {
    tenant: 'diku',
    url: 'https://folio-testing-okapi.dev.folio.org',
  },
  store: {
    getState: () => ({
      okapi: {
        token: 'abc',
      },
    }),
    dispatch: () => {},
    subscribe: () => {},
    replaceReducer: () => {},
  },
  timezone: 'UTC',
  user: {
    perms: {},
    user: {
      id: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
      username: 'diku_admin',
    },
  },
  withOkapi: true,
};

const props = {
  user: okapiCurrentUser.user,
  pristine: true,
  submitting: true,
  invalid: false,
  params: {},
  onDeleteItem: jest.fn(),
  onClose: jest.fn(),
  handleSubmit: jest.fn(),
  onSubmit: jest.fn(),
  connect: jest.fn(),
  intl: {
    formatMessage: jest.fn(),
  },
  stripes: STRIPES,
  initialValues: {},
  blockTemplates: [
    {
      id: 1,
      code: 'testCode1',
      name: 'name1'
    },
    {
      id: 2,
      code: 'testCode2',
      name: 'name2'
    }
  ],
  form: {
    batch: jest.fn(),
    getRegisteredFields: jest.fn(),
    change: jest.fn()
  },
};

describe('Patron Block Form', () => {
  beforeEach(() => {
    renderPatronBlockForm(props);
  });
  afterEach(cleanup);

  it('should render the component', () => {
    expect(screen.getByText('ui-users.blocks.form.button.create')).toBeInTheDocument();
  });
  it('Toggle button must work', () => {
    userEvent.click(document.querySelector('[id=accordion-toggle-button-blockInformationSection]'));
    expect(screen.getByText('ui-users.blocks.form.label.information')).toBeInTheDocument();
  });
  it('Expand button must work', () => {
    userEvent.click(document.querySelector('[data-tast-expand-button="true"]'));
    expect(screen.getByText('ui-users.blocks.form.label.block')).toBeInTheDocument();
  });
  it('Change template must work', () => {
    userEvent.click(document.querySelector('[id="option-stripes-selection-45-1-1"]'));
    expect(screen.getByText('name2 (testCode2)')).toBeInTheDocument();
  });
});

