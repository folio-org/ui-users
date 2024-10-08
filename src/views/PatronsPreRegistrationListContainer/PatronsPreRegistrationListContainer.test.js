import {
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import '../../../test/jest/__mock__/matchMedia.mock';

import PatronsPreRegistrationListContainer from './PatronsPreRegistrationListContainer';

jest.unmock('@folio/stripes/components');
jest.mock('./PatronsPreRegistrationList', () => jest.fn(() => <div>PatronsPreRegistrationList</div>));
jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  SearchField: jest.fn((props) => (
    <input
      {...props}
    />
  )),
}));

const defaultProps = {
  queryGetter: jest.fn(),
  onClose: jest.fn(),
  source: {
    loaded: () => true,
    totalCount: () => 0,
  },
  data: [],
  onNeedMoreData: jest.fn(),
};
const renderComponent = (props) => renderWithRouter(<PatronsPreRegistrationListContainer {...defaultProps} {...props} />);

describe('PatronsPreRegistrationListContainer', () => {
  it('should render component', () => {
    renderComponent();
    expect(screen.getByText('ui-users.stagingRecords.list.searchResults')).toBeInTheDocument();
  });

  it('should display search pane', () => {
    renderComponent();
    expect(screen.getByText('ui-users.stagingRecords.list.search')).toBeInTheDocument();
  });

  it('should toggle search pane', async () => {
    renderComponent();
    expect(screen.getByText('ui-users.stagingRecords.list.search')).toBeInTheDocument();
    const collapseButton = document.querySelector('[icon="caret-left"]');
    await userEvent.click(collapseButton);
    await waitFor(() => expect(screen.queryByText('ui-users.stagingRecords.list.search')).toBeNull());
  });

  it('should reset search on clicking reset button', async () => {
    renderComponent();
    const resetButton = document.querySelector('[id="preRegistrationListResetAllButton"]');
    expect(resetButton).toBeDisabled();
    await userEvent.type(document.querySelector('[id="stagingRecordsSearch"]'), 'record');
    expect(resetButton).toBeEnabled();
    await userEvent.click(resetButton);
    await waitFor(() => expect(resetButton).toBeDisabled());
  });

  it('should render PatronsPreRegistrationList component', () => {
    const props = {
      ...defaultProps,
      source: {
        loaded: () => true,
        totalCount: () => 1,
      },
      data: [
        {
          'id': 'd717f710-ddf3-4208-9784-f443b74c40cd',
          'active': true,
          'generalInfo': {
            'firstName': 'new-record-2',
            'preferredFirstName': 'New Record',
            'middleName': '',
            'lastName': 'new-record-2'
          },
          'addressInfo': {
            'addressLine0': '123 Main St',
            'addressLine1': 'Apt 4B',
            'city': 'Metropolis',
            'province': 'NY',
            'zip': '12345',
            'country': 'USA'
          },
          'contactInfo': {
            'phone': '555-123456',
            'mobilePhone': '555-5678',
            'email': 'new-record-2@test.com'
          },
          'preferredEmailCommunication': [
            'Support',
            'Programs'
          ],
          'metadata': {
            'createdDate': '2024-04-29T13:29:41.711+00:00',
            'createdByUserId': '6d8a6bf2-5b5f-4168-aa2f-5c4e67b4b65c',
            'updatedDate': '2024-04-29T13:29:41.711+00:00',
            'updatedByUserId': '6d8a6bf2-5b5f-4168-aa2f-5c4e67b4b65c'
          }
        }
      ],
    };
    renderComponent(props);

    expect(screen.getByText('PatronsPreRegistrationList')).toBeInTheDocument();
  });
});
