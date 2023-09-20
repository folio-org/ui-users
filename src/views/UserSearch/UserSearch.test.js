import React from 'react';
import { screen } from '@folio/jest-config-stripes/testing-library/react';

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

const defaultProps = {
  mutator: {},
  resources: {
    owners: {
      records: [],
    },
  },
  stripes: {
    hasInterface: jest.fn(),
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
    expect(screen.getByText('ui-users.status')).toBeTruthy();
  });
});
