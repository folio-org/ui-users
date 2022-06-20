import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import PatronBlock from './PatronBlock';

jest.unmock('@folio/stripes/components');

const renderPatronBlock = (props) => renderWithRouter(<PatronBlock {...props} />);

const STRIPES = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
};

const mockRedirect = jest.fn();

const props = {
  accordionId: 'patronBlocksSection',
  expanded: true,
  onToggle: jest.fn(),
  stripes: STRIPES,
  match: {
    params: {
      id: 'e6dc87a3-591b-43e0-a768-d3552b44878b',
    }
  },
  history: {
    push: mockRedirect,
  },
  location: {
    search: '',
  },
  intl: { formatMessage: jest.fn() },
  mutator: {
    activeRecord: {
      update: jest.fn(),
    }
  },
  patronBlocks: [{
    borrowing: true,
    desc: 'Sample',
    id: 'f1e0d3e2-fa48-4a82-b371-bea4e44178ab',
    patronMessage: '',
    renewals: true,
    requests: true,
    staffInformation: '',
    type: 'Manual',
    userId: 'e6dc87a3-591b-43e0-a768-d3552b44878b',
    metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' }
  }]
};

describe('render ProxyPermissions component', () => {
  beforeEach(() => {
    renderPatronBlock(props);
  });
  it('Component must be rendered', () => {
    expect(screen.getByText('ui-users.settings.patronBlocks')).toBeInTheDocument();
  });
  it('Clicking the patron row should redirect via history.push', () => {
    userEvent.click(document.querySelector('[data-row-inner="0"]'));
    expect(mockRedirect).toHaveBeenCalled();
  });
  /* Need to fix the bug UIU-2538 for the sorting to work so that this test case can be uncommented */

  // it('checking for sort order', () => {
  //   userEvent.click(document.querySelector('[id="clickable-list-column-blockedactions"]'));
  //   expect(screen.getByText('Sample')).toBeInTheDocument();
  // });
});
