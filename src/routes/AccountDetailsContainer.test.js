import renderWithRouter from '../../test/jest/helpers/renderWithRouter';
import AccountDetailsContainer from './AccountDetailsContainer';

const resources = {
  selUser: { isPending: false },
  patronGroups: { isPending: false },
  instance: { isPending: false },
  loans: { isPending: false },
  accountActions: { isPending: false },
  feefineshistory: { isPending: false },
};

const okapi = {
  currentUser: {
    curServicePoint: { id: 'sp1' },
  },
};

const match = {
  params: {
    id: 'userId',
  },
};

const renderAccountDetailsContainer = (props = {}) => renderWithRouter(
  <AccountDetailsContainer
    match={match}
    resources={resources}
    okapi={okapi}
    {...props}
  />
);

describe('AccountDetailsContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when a user data is being fetched', () => {
    it('should render a loading', () => {
      const props = {
        resources: {
          selUser: { isPending: true },
        },
      };

      const { getByText } = renderAccountDetailsContainer(props);

      expect(getByText('LoadingView')).toBeInTheDocument();
    });
  });
});
