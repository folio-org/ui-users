
import user from 'fixtures/okapiCurrentUser';
import { screen, cleanup } from '@testing-library/react';
import { Form } from 'react-final-form';

import renderWithRouter from 'helpers/renderWithRouter';
import EditProxy from './EditProxy';

jest.unmock('@folio/stripes/components');

const onSubmit = jest.fn();

const arrayMutators = {
  concat: jest.fn(),
  move: jest.fn(),
  pop: jest.fn(),
  push: jest.fn(),
  remove: jest.fn(),
  removeBatch: jest.fn(),
  shift: jest.fn(),
  swap: jest.fn(),
  unshift: jest.fn(),
  update: jest.fn()
};

const renderEditProxy = (props) => {
  const component = () => (
    <>
      <EditProxy {...props} />
    </>
  );
  renderWithRouter(
    <Form
      id="form-user"
      mutators={{
        ...arrayMutators
      }}
      onSubmit={onSubmit}
      render={component}
    />
  );
};

const onToggleMock = jest.fn();

const propData = {
  fullName: 'TestEditProxy',
  expanded: true,
  onToggle: onToggleMock,
  accordionId: 'proxy',
  proxies: [
    {
      proxy : {
        id: 'test',
        name: 'test',
        metadata: {
          createdDate: '2021-11-23T09:53:48.906+00:00',
          createdByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27',
          updatedDate: '2021-11-23T09:53:48.906+00:00',
          updatedByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27'
        }
      },
      user,
    }
  ],
  sponsors: [
    {
      proxy : {
        id: 'test',
        name: 'test',
        metadata: {
          createdDate: '2021-11-23T09:53:48.906+00:00',
          createdByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27',
          updatedDate: '2021-11-23T09:53:48.906+00:00',
          updatedByUserId: '3507800c-eda8-53a5-b466-c7ac37034a27'
        }
      },
      user,
    }
  ],
  intl: {
    formatMessage: jest.fn(),
  },
};


describe('EditProxy Component', () => {
  beforeEach(() => {
    renderEditProxy(propData);
  });
  afterEach(cleanup);
  it('Check if component  renders', () => {
    expect(screen.getByText('ui-users.permissions.proxy.sponsor'));
    expect(screen.getByText('ui-users.permissions.isProxyFor'));
  });
});
