import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import React from 'react';
import {
  screen,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import renderWithRouter from 'helpers/renderWithRouter';
import PatronBlockLayer from './PatronBlockLayer';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderPatronBlockLayer = (props) => renderWithRouter(<PatronBlockLayer {...props} />);

const STRIPES = {
  connect: jest.fn((component) => component),
  config: {},
  currency: 'USD',
  hasInterface: () => true,
  hasPerm: jest.fn().mockReturnValue(true),
  clone: jest.fn(),
  setToken: jest.fn(),
  locale: 'en-US',
  logger: {
    log: () => {},
  },
  okapi: {
    tenant: 'diku',
    url: 'https://folio-testing-okapi.dev.folio.org',
  },
  store: {
    getState: () => ({
      okapi: {
        token: 'abc',
      },
    }),
    dispatch: () => {},
    subscribe: () => {},
    replaceReducer: () => {},
  },
  timezone: 'UTC',
  user: {
    perms: {},
    user: {
      id: 'b1add99d-530b-5912-94f3-4091b4d87e2c',
      username: 'diku_admin',
    },
  },
  withOkapi: true,
};

const historyMock = jest.fn();
const updateMock = jest.fn();

const props = {
  mutator: {
    manualPatronBlocks: {
      POST: jest.fn(),
      PUT: jest.fn(() => new Promise((resolve, _) => {
        resolve('Updated');
      })),
      DELETE: jest.fn(() => new Promise((resolve, _) => {
        resolve('Deleted');
      }))
    },
    activeRecord: {
      update: updateMock
    }
  },
  resources: {
    manualPatronBlocks: {
      records: [{
        borrowing: true,
        desc: 'Sample',
        id: 'f1e0d3e2-fa48-4a82-b371-bea4e44178ab',
        patronMessage: '',
        renewals: true,
        requests: true,
        staffInformation: '',
        type: 'Manual',
        userId: 'a51df26e-b472-5c06-8362-01025b90238b',
        metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' }
      }]
    }
  },
  user: okapiCurrentUser.user,
  selectedPatronBlock: {},
  intl: {
    formatMessage: jest.fn(),
  },
  stripes: STRIPES,
  location: {
    search: ''
  },
  history: {
    push: historyMock
  },
  match: {
    params: {
      patronblockid: 'f1e0d3e2-fa48-4a82-b371-bea4e44178ab',
      id: 'a51df26e-b472-5c06-8362-01025b90238b',
      selectedPatronBlock: 'f1e0d3e2-fa48-4a82-b371-bea4e44178ab',


    }
  }
};

const secondaryProps = {
  mutator: {
    manualPatronBlocks: {
      POST: jest.fn(() => new Promise((resolve, _) => {
        resolve('Created');
      })),
      PUT: jest.fn(() => new Promise((resolve, _) => {
        resolve('Updated');
      })),
      DELETE: jest.fn(() => new Promise((resolve, _) => {
        resolve('Deleted');
      }))
    },
    activeRecord: {
      update: updateMock
    }
  },
  resources: {
    manualPatronBlocks: {
      records: [{
        borrowing: true,
        desc: 'Sample',
        id: 'f1e0d3e2-fa48-4a82-b371-bea4e44178ab',
        patronMessage: '',
        renewals: true,
        requests: true,
        staffInformation: '',
        type: 'Manual',
        userId: 'a51df26e-b472-5c06-8362-01025b90238b',
        metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' }
      }]
    }
  },
  user: okapiCurrentUser.user,
  selectedPatronBlock: {},
  intl: {
    formatMessage: jest.fn(),
  },
  stripes: STRIPES,
  history: {
    push: historyMock
  },
  location: {
    search: ''
  },
  match: {
    params: {
      id: 'a51df26e-b472-5c06-8362-01025b90238b',
    }
  }
};

const mockData = {
  id: 'testId',
  name: 'testName',
  expirationDate: '2021-12-27T12:08:53.639+00:00',
  metadata: {
    createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
    createdDate: '2021-12-27T12:08:53.639+00:00',
    updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
    updatedDate: '2021-12-27T12:09:22.973+00:00',
  }
};

const PatronBlockFormMock = ({ onSubmit, onDeleteItem, onClose }) => (
  <>
    <div>Patron Block Form</div>
    <button type="button" data-testid="submit" onClick={() => onSubmit(mockData)}>Submit</button>
    <button type="button" data-testid="delete" onClick={() => onDeleteItem()}>Delete</button>
    <button type="button" data-testid="cancel" onClick={() => onClose()}>Close</button>
  </>
);

PatronBlockFormMock.propTypes = {
  onClose: PropTypes.func,
  onDeleteItem: PropTypes.func,
  onSubmit: PropTypes.func,
};

jest.mock('./PatronBlockForm', () => PatronBlockFormMock);

describe('Patron Block layer', () => {
  describe('With params id', () => {
    beforeEach(() => {
      renderPatronBlockLayer(props);
    });
    afterEach(cleanup);
    it('should render the component', () => {
      expect(screen.getByText('Patron Block Form')).toBeInTheDocument();
    });
    it('on Cancel click', () => {
      userEvent.click(screen.getByTestId('cancel'));
      expect(historyMock).toHaveBeenCalled();
    });
    it('on Submit click', () => {
      userEvent.click(screen.getByTestId('submit'));
      expect(updateMock).toHaveBeenCalled();
    });
    it('on Delete click', () => {
      userEvent.click(screen.getByTestId('delete'));
      userEvent.click(document.querySelector('[id="clickable-patron-block-confirmation-modal-confirm"]'));
    });
    it('on Delete click', () => {
      userEvent.click(screen.getByTestId('delete'));
      userEvent.click(document.querySelector('[id="clickable-patron-block-confirmation-modal-confirm"]'));
    });
    it('on Submit click without patronblock id', () => {
      userEvent.click(screen.getByTestId('submit'));
      expect(updateMock).toHaveBeenCalled();
    });
  });
  describe('Without default id', () => {
    it('on Submit click without patronblock id', () => {
      renderPatronBlockLayer(secondaryProps);
      userEvent.click(screen.getByTestId('submit'));
      screen.debug();
    });
    it('on Delete click without patronblock id', () => {
      renderPatronBlockLayer(secondaryProps);
      userEvent.click(screen.getByTestId('delete'));
      userEvent.click(document.querySelector('[id="clickable-patron-block-confirmation-modal-confirm"]'));
    });
  });
});
