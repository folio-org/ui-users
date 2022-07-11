import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';

import renderWithRouter from 'helpers/renderWithRouter';
import SearchForm from './SearchForm';

jest.unmock('@folio/stripes/components');

const onSubmit = jest.fn();
const mockFunc = jest.fn();
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

const renderSearchForm = (props) => {
  const component = () => (
    <SearchForm {...props} />
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

const propData = {
  config: [{
    cql: 'permissionType',
    label: <div>Label</div>,
    name: 'permissionType',
    values: [
      {
        cql: 'permissionSets',
        displayName: <div>Permissionsets</div>,
        name: 'permissionSets',
        value: false,
      },
      {
        cql: 'permissions',
        displayName: <div>permissionsss</div>,
        name: 'permissions',
        value: true,
      },
    ],
  },
  {
    cql: 'status',
    label: <div>status</div>,
    name: 'status',
    values: [
      {
        cql: 'assigned',
        displayName: <div>assigned</div>,
        name: 'assigned',
        value: false,
      },
      {
        cql: 'unassigned',
        displayName: <div>unassigned</div>,
        name: 'unassigned',
        value: true,
      },
    ],
  }],
  onSubmitSearch: mockFunc,
  onChangeFilter: jest.fn(),
  onClearFilter: jest.fn(),
  resetSearchForm: mockFunc,
  filters: {
    cql: 'status',
    label: <div>status</div>,
    name: 'status',
    values: [
      {
        cql: 'assigned',
        displayName: <div>assigned</div>,
        name: 'assigned',
        value: false,
      },
      {
        cql: 'unassigned',
        displayName: <div>unassigned</div>,
        name: 'unassigned',
        value: true,
      },
    ],
  }
};


describe('Search Form Component', () => {
  beforeEach(() => {
    renderSearchForm(propData);
  });
  afterEach(cleanup);
  it('Check if component  renders', () => {
    expect(screen.getByText('permissionsss')).toBeInTheDocument();
  });
  it('Check if search works', () => {
    userEvent.type(document.querySelector('[data-test-search-field="true"]'), 'permissions');
    userEvent.click(document.querySelector('[data-test-submit-button="true"]'));
    expect(mockFunc).toHaveBeenCalled();
  });
  it('Check if reset all works', () => {
    userEvent.click(document.querySelector('[data-test-reset-all-button="true"]'));
    expect(mockFunc).toHaveBeenCalled();
  });
});
