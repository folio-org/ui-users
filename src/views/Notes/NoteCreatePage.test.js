import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
    it('should hold appropriate values for referredRecordData', () => {
      const referredRecordData = retrieveNoteReferredEntityDataFromLocationState(location.state);
      const expectedObject = {
        name: 'rick, psych',
        type: 'user',
        id: '2205005b-ca51-4a04-87fd-938eefa8f6de',
      };
      expect(referredRecordData).toMatchObject(expectedObject);
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
    it('should hold appropriate values for referredRecordData', () => {
      const referredRecordData = retrieveNoteReferredEntityDataFromLocationState('');
      expect(referredRecordData).toBeNull();
    });
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
