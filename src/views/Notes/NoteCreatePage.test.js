import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NoteCreatePage } from '@folio/stripes/smart-components';
import NoteCreateRoute from './NoteCreatePage';
import { retrieveNoteReferredEntityDataFromLocationState } from '../../components/util';

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  NoteCreatePage: jest.fn(() => (<div>NoteCreatePage</div>)),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Redirect: jest.fn(() => <div>Users</div>)
}));

const history = {
  'length': 42,
  'action': 'PUSH',
  location: {
    hash: '',
    key: '9pb09t',
    pathname: '/users/notes/new',
    search: '',
    state: {
      entityId: '2205005b-ca51-4a04-87fd-938eefa8f6de',
      entityName: 'rick, psych',
      entityType: 'user',
      referredRecordData: {}
    }
  },
  'createHref': () => {},
  'push': () => {},
  'replace': () => {},
  'go': () => {},
  'goBack': () => {},
  'goForward': () => {},
  'block': () => {},
  'listen': () => {},
};

const location = history.location;

const renderNoteCreateRoute = (props) => render(
  <MemoryRouter>
    <NoteCreateRoute {...props} />
  </MemoryRouter>
);

describe('Note Create Route', () => {
  describe('should render Note Create Page', () => {
    it('should pass wel defined referredEntityData prop to NoteCreatePage when location.state is defined', () => {
      const props = {
        history,
        location
      };
      renderNoteCreateRoute(props);
      expect(NoteCreatePage.mock.calls[0][0].referredEntityData).toEqual(retrieveNoteReferredEntityDataFromLocationState(props.location.state));
    });
    it('should render Note Create Page', async () => {
      const { getByText } = renderNoteCreateRoute({
        history,
        location
      });

      expect(getByText('NoteCreatePage')).toBeInTheDocument();
    });
  });
  describe('should not render Note Create Page', () => {
    it('should render Note Create Page', async () => {
      const { getByText } = renderNoteCreateRoute({
        history: {
          ...history,
          location: {
            ...location,
            state: ''
          },
        },
        location: {
          ...location,
          state: ''
        }
      });

      expect(getByText('Users')).toBeInTheDocument();
    });
  });
});
