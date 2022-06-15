import { screen, fireEvent } from '@testing-library/react';
import { FormattedMessage } from 'react-intl';

import renderWithRouter from 'helpers/renderWithRouter';
import Filters from './Filters';

jest.unmock('@folio/stripes/components');

const renderFilters = (props) => renderWithRouter(
  <Filters {...props} />
);

const props = {
  query: {},
  showFilters: true,
  mutator: {
    query: {
      update: jest.fn(),
    },
  },
  filterConfig: [
    {
      label: <FormattedMessage id="ui-users.accounts.history.columns.owner" />,
      name: 'owner',
      cql: 'feeFineOwner',
      values: [],
    }, {
      label: <FormattedMessage id="ui-users.accounts.history.columns.status" />,
      name: 'status',
      cql: 'paymentStatus.name',
      values: [],
    }, {
      label: <FormattedMessage id="ui-users.details.field.feetype" />,
      name: 'type',
      cql: 'feeFineType',
      values: [],
    }, {
      label: <FormattedMessage id="ui-users.details.field.type" />,
      name: 'material',
      cql: 'materialType',
      values: [],
    },
  ],
  filters: {},
  toggle: jest.fn(),
  onChangeSearch: jest.fn(),
  onChangeFilter: jest.fn(),
  onClearSearch: jest.fn(),
  onClearFilters: jest.fn(),
};

describe('Filters component', () => {
  it('should render properly', () => {
    renderFilters(props);

    expect(screen.queryByText('ui-users.accounts.history.filter')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.accounts.history.columns.owner')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.accounts.history.columns.status')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.details.field.feetype')).toBeInTheDocument();
    expect(screen.queryByText('ui-users.details.field.type')).toBeInTheDocument();
  });

  describe('when showFilters prop is false', () => {
    it('should not show Filters component', () => {
      renderFilters({
        ...props,
        showFilters: false,
      });

      expect(screen.queryByText('ui-users.accounts.history.filter')).not.toBeInTheDocument();
    });
  });

  describe('whene there is a loan prop', () => {
    it('should render search-button', () => {
      renderFilters({
        ...props,
        query: {
          loan: 'mock-loan',
        },
      });

      expect(screen.getByText('mock-loan')).toBeInTheDocument();
    });

    describe('when click on search-button', () => {
      it('should fire query update with null loan', () => {
        renderFilters({
          ...props,
          query: {
            loan: 'mock-loan',
          },
        });

        fireEvent.click(screen.getByText('mock-loan'));

        expect(props.mutator.query.update).toBeCalledWith({ loan: null });
      });
    });
  });
});
