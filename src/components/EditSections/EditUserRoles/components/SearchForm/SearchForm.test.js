import { screen, cleanup, render } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import SearchForm from './SearchForm';

jest.unmock('@folio/stripes/components');

const mockSearchFunc = jest.fn();
const mockResetFunc = jest.fn();

const renderSearchForm = (props) => {
  return render(<SearchForm {...props} />);
};

const propData = {
  config: [
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
  onSubmitSearch: mockSearchFunc,
  onChangeFilter: jest.fn(),
  onClearFilter: jest.fn(),
  resetSearchForm: mockResetFunc,
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
    expect(screen.getByText('ui-users.search')).toBeInTheDocument();
  });
  it('Check if search works', async () => {
    await userEvent.type(document.querySelector('[data-test-search-field="true"]'), 'roless');
    await userEvent.click(document.querySelector('[data-test-submit-button="true"]'));

    expect(mockSearchFunc).toHaveBeenCalled();
  });
  it('Check if reset all works', async () => {
    await userEvent.click(document.querySelector('[data-test-reset-all-button="true"]'));

    expect(mockResetFunc).toHaveBeenCalled();
  });
});
