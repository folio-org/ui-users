import React from 'react';
import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import '../../../test/jest/__mock__/matchMedia.mock';

import UserSearch from './UserSearch';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

jest.mock('@folio/stripes/smart-components', () => {
  // eslint-disable-next-line global-require
  const customField = require('fixtures/multiSelectCustomField');
  return {
    // eslint-disable-next-line global-require
    ...jest.requireActual('@folio/stripes/smart-components'),
    useCustomFields: jest.fn(() => [[customField]]),
  };
});
jest.mock('../../components/LinkToPatronPreRegistrations', () => {
  return () => <div>LinkToPatronPreRegistrations</div>;
});

const defaultProps = {
  mutator: {},
  resources: {
    owners: {
      records: [],
    },
  },
  stripes: {
    hasInterface: jest.fn(),
    hasPerm: () => true,
  },
  location: {},
  history: {},
  match: {},
  intl: {
    formatMessage: jest.fn(),
  },
  okapi: {
    currentUser: {
      id: 'test',
    },
  }
};

const renderComponent = (props) => renderWithRouter(<UserSearch {...defaultProps} {...props} />);

describe('UserSearch', () => {
  it('should render component', () => {
    renderComponent();
    expect(screen.getByText('ui-users.userSearchResults')).toBeInTheDocument();
  });

  it('should render actions menu', () => {
    renderComponent();
    expect(screen.getByText('ui-users.actions')).toBeInTheDocument();
  });

  it('should display "Search patron preregistration records"', async () => {
    renderComponent();
    const actionsButton = screen.getByText('ui-users.actions');

    await userEvent.click(actionsButton);

    expect(screen.getByText('LinkToPatronPreRegistrations')).toBeInTheDocument();
  });
});
