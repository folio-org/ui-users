import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';

import '__mock__/currencyData.mock';
import loans from 'fixtures/openLoans';
import loan from 'fixtures/openLoan';
import loanPolicyNames from 'fixtures/loanPolicyNames';

import OpenLoansControl from './OpenLoansControl';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

jest.mock('../../util', () => {
  return {
    ...jest.requireActual('../../util'),
    formatDateAndTime: jest.fn(),
  };
});

const ModalContentMock = ({ buildRecords,
  feeFineCount,
  renewSelected,
  toggleColumn,
  toggleAll,
  getLoanPolicy,
  isLoanChecked,
  toggleItem,
  hideChangeDueDateDialog,
  showChangeDueDateDialog,
  onClosePatronBlockedModal,
  openPatronBlockedModal,
  handleOptionsChange }) => {
  let loansLength = 0;
  const [loanPolicies, setLoanPolicies] = useState('');

  const handleFeeFineCount = () => {
    loansLength = feeFineCount(loan);
  };

  const handleLoanPolicy = () => {
    setLoanPolicies(getLoanPolicy('985fd5a1-3634-4b0d-8c13-0d4fcf0b8afa'));
  };

  return (
    <>
      <div>Open Loans Control </div>
      <div>Loans Length {loansLength}</div>
      <div>{loanPolicies}</div>
      <button type="button" data-testid="close-dialog" onClick={() => buildRecords(loans)}>Build Records</button>
      <button type="button" data-testid="close-dialog" onClick={handleFeeFineCount}>FeeFineCount</button>
      <button type="button" data-testid="close-dialog" onClick={() => renewSelected()}>RenewSelected</button>
      <button type="button" data-testid="close-dialog" onClick={(e) => toggleColumn(e)}>toggleColumn</button>
      <button type="button" data-testid="close-dialog" onClick={(e) => toggleAll(e)}>toggleAll</button>
      <button type="button" data-testid="close-dialog" onClick={handleLoanPolicy}>getLoanPolicy</button>
      <button type="button" data-testid="close-dialog" onClick={() => isLoanChecked('40f5e9d9-38ac-458e-ade7-7795bd821652')}>isLoanChecked</button>
      <button type="button" data-testid="close-dialog" onClick={(e) => toggleItem(e, loan)}>toggleItem</button>
      <button type="button" data-testid="close-dialog" onClick={() => hideChangeDueDateDialog()}>hideChangeDueDateDialog</button>
      <button type="button" data-testid="close-dialog" onClick={() => showChangeDueDateDialog()}>showChangeDueDateDialog</button>
      <button type="button" data-testid="close-dialog" onClick={() => onClosePatronBlockedModal()}>onClosePatronBlockedModal</button>
      <button type="button" data-testid="close-dialog" onClick={() => openPatronBlockedModal()}>openPatronBlockedModal</button>
      <button type="button" data-testid="close-dialog" onClick={() => handleOptionsChange({ loan, action: 'declareLost', itemRequestCount: 10 })}>handleOptionsChange</button>
      <button type="button" data-testid="close-dialog" onClick={() => handleOptionsChange({ loan, action: 'claimReturned', itemRequestCount: 10 })}>handleOptionsChange1</button>
      <button type="button" data-testid="close-dialog" onClick={() => handleOptionsChange({ loan, action: 'markAsMissing', itemRequestCount: 10 })}>handleOptionsChange2</button>
      <button type="button" data-testid="close-dialog" onClick={() => handleOptionsChange({ loan, action: 'feefineDetails', itemRequestCount: 10 })}>feefineDetails</button>
      <button type="button" data-testid="close-dialog" onClick={() => handleOptionsChange({ loan, action: 'renew', itemRequestCount: 10 })}>renew</button>
    </>);
};
ModalContentMock.propTypes = {
  buildRecords: PropTypes.func,
  feeFineCount: PropTypes.func,
  renewSelected: PropTypes.func,
  toggleColumn: PropTypes.func,
  toggleAll: PropTypes.func,
  getLoanPolicy: PropTypes.func,
  isLoanChecked: PropTypes.func,
  toggleItem: PropTypes.func,
  hideChangeDueDateDialog: PropTypes.func,
  showChangeDueDateDialog: PropTypes.func,
  onClosePatronBlockedModal: PropTypes.func,
  openPatronBlockedModal: PropTypes.func,
  handleOptionsChange: PropTypes.func,
};

jest.mock('./components/OpenLoansWithStaticData', () => ModalContentMock);

const STRIPES = {
  connect: (Component) => Component,
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

const mockGet = jest.fn(() => new Promise((resolve, _) => resolve([loanPolicyNames])));
const mockPost = jest.fn((record) => new Promise((resolve, _) => resolve(record)));
const mockReset = jest.fn(() => new Promise((resolve, _) => resolve()));
const mockFormatTime = jest.fn();
const declareLostMock = jest.fn();
const renewMock = jest.fn();
const claimReturnedMock = jest.fn();
const markAsMissingMock = jest.fn();

const propsData = {
  intl : {
    formatTime: mockFormatTime,
  },
  stripes: STRIPES,
  mutator: {
    query: {},
    activeRecord: {
      update: jest.fn(),
    },
    loanPolicies: {
      GET: mockGet,
      reset: mockReset
    },
    renew: {
      POST: mockPost,
    },
    requests: {
      GET: mockGet,
      replace: jest.fn(),
      reset: mockReset
    }
  },
  resources: {
    activeRecord: {
      user: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402',
    },
    loanAccount: {
      records: [],
      resource: 'loanAccount',
    },
    loanPolicies: {
      records: [],
      resource: 'loanPolicies',
    },
    loansHistory : {
      records: [],
      resource: 'loansHistory',
    },
    patronGroups: {
      resource: 'patronGroups',
      records: [{
        desc: 'Staff Member',
        expirationOffsetInDays: 730,
        group: 'staff',
        id: '3684a786-6671-4268-8ed0-9db82ebca60b'
      }],
    },
    query: {
      query: ''
    },
  },
  okapi: {
    okapiReady: true,
    currentUser: okapiCurrentUser,
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkaWt1X2FkbWluIiwidHlwZSI6ImxlZ2FjeS1hY2Nlc3MiLCJ1c2VyX2lkIjoiMzJiMDZlODItODAzZC01ZDFjLWE5OTgtZjA5ZThkMDUwZWEyIiwiaWF0IjoxNjU3NTI1NDExLCJ0ZW5hbnQiOiJkaWt1In0.Nv2ZD1wcIDDACCistRPSOnvJ1cfmVIBt9KMxCiNlXEA',
    url: 'https://folio-snapshot-okapi.dev.folio.org',
  },
  user: {
    id: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402',
    patronGroup: '503a81cd-6c26-400f-b620-14c08943697c',
    type: 'patron',
    updatedDate: '2022-07-11T01:52:01.961+00:00',
    username: 'delpha',
    barcode: '508444097915063',
    departments: []
  },
  history: {},
  location: { },
  match: { },
  patronGroup: {
    desc: 'Faculty Member',
    expirationOffsetInDays: 365,
    group: 'faculty',
    id: '503a81cd-6c26-400f-b620-14c08943697c',

  },
  requestCounts: {},
  loanPolicies: {
    '985fd5a1-3634-4b0d-8c13-0d4fcf0b8afa': '3 day'
  },
  loans,
  patronBlocks: [],
  renew: renewMock,
  declareLost: declareLostMock,
  claimReturned: claimReturnedMock,
  markAsMissing: markAsMissingMock
};

const renderOpenLoansControl = (props) => renderWithRouter(<OpenLoansControl {...props} />);

describe('OpenLoans Control', () => {
  beforeEach(() => {
    renderOpenLoansControl(propsData);
  });
  test('Component Must be Rendered', () => {
    expect(screen.getByText('Open Loans Control')).toBeInTheDocument();
  });
  test('Checking if Build Records method is working', () => {
    userEvent.click(screen.getByText('Build Records'));
    userEvent.click(screen.getByText('FeeFineCount'));
    expect(screen.getByText('Loans Length 0')).toBeInTheDocument();
  });
  test('Checking if Build Records method is working', () => {
    userEvent.click(screen.getByText('toggleColumn'));
    userEvent.click(screen.getByText('toggleAll'));
    userEvent.click(screen.getByText('toggleItem'));
    userEvent.click(screen.getByText('getLoanPolicy'));
    expect(screen.getByText('3 day'));
  });
  test('Loan policy check and toggle columns', () => {
    userEvent.click(screen.getByText('toggleColumn'));
    userEvent.click(screen.getByText('toggleAll'));
    userEvent.click(screen.getByText('toggleItem'));
    userEvent.click(screen.getByText('getLoanPolicy'));
    expect(screen.getByText('3 day'));
  });
  test('declare Lost Check with duedate dialogs', () => {
    userEvent.click(screen.getByText('hideChangeDueDateDialog'));
    userEvent.click(screen.getByText('showChangeDueDateDialog'));
    userEvent.click(screen.getByText('onClosePatronBlockedModal'));
    userEvent.click(screen.getByText('openPatronBlockedModal'));
    userEvent.click(screen.getByText('handleOptionsChange'));
    expect(declareLostMock).toHaveBeenCalled();
  });
  test('claim Returned Check with renew', () => {
    userEvent.click(screen.getByText('renew'));
    userEvent.click(screen.getByText('handleOptionsChange1'));
    expect(claimReturnedMock).toHaveBeenCalled();
  });
  test('Mark as Missing Check with feefineDetails', () => {
    userEvent.click(screen.getByText('feefineDetails'));
    userEvent.click(screen.getByText('handleOptionsChange2'));
    expect(markAsMissingMock).toHaveBeenCalled();
  });
  test('Renew Selected check', () => {
    userEvent.click(screen.getByText('RenewSelected'));
    expect(renewMock).toHaveBeenCalled();
  });
});
