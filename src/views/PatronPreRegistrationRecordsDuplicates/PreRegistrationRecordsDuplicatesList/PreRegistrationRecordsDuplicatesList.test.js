import { screen } from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';

import PreRegistrationRecordsDuplicatesList from './PreRegistrationRecordsDuplicatesList';

jest.unmock('@folio/stripes/components');
jest.mock('react-virtualized-auto-sizer', () => ({ children }) => children({ height: 500, width: 500 }));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({
    pathname: '/users',
    search: '',
    state: {},
  }),
}));

const patronGroups = [{
  id: '3684a786-6671-4268-8ed0-9db82ebca60b',
  group: 'test',
}];

const users = [{
  active: true,
  personal: {
    firstName: 'John',
    lastName: 'Galt',
    email: 'ex@mp.le'
  },
  username: 'test',
  type: 'patron',
  patronGroup: '3684a786-6671-4268-8ed0-9db82ebca60b',
  barcode: '123456789',
}];

const defaultProps = {
  isLoading: false,
  onMerge: jest.fn(),
  patronGroups,
  totalRecords: users.length,
  users,
};

const renderComponent = (props) => renderWithRouter(
  <PreRegistrationRecordsDuplicatesList
    {...defaultProps}
    {...props}
  />
);

describe('PreRegistrationRecordsDuplicatesList', () => {
  it('should render component', () => {
    renderComponent();

    // MCL columns
    expect(screen.getByText('ui-users.action')).toBeInTheDocument();
    expect(screen.getByText('ui-users.information.name')).toBeInTheDocument();
    expect(screen.getByText('ui-users.information.barcode')).toBeInTheDocument();
    expect(screen.getByText('ui-users.information.patronGroup')).toBeInTheDocument();
    expect(screen.getByText('ui-users.information.username')).toBeInTheDocument();
    expect(screen.getByText('ui-users.contact.email')).toBeInTheDocument();
  });
});
