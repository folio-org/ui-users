import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import WarningModal from './WarningModal';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderWarningModal = (props) => renderWithRouter(<WarningModal {...props} />);

const mockFunc = jest.fn();
const mockFuncClose = jest.fn();

const accountsData = [
  {
    amount: 5,
    contributors: [],
    feeFineId: 'f2306bef-d9fb-439c-8c65-420a7a86f7a2',
    feeFineOwner: 'TestOwner',
    feeFineType: 'Test Feefine type',
    id: '2157711b-4cd6-494e-bf0d-d397ab545400',
    metadata: {
      createdDate: '2022-01-06T04:52:19.214+00:00',
      createdByUserId: '0fc2f695-07f9-5080-817b-364db1480f9e',
      updatedDate: '2022-01-06T04:52:19.214+00:00',
      updatedByUserId: '0fc2f695-07f9-5080-817b-364db1480f9e'
    },
    ownerId: 'a152c90d-e94d-4784-ab4f-4208a0672673',
    paymentStatus: { name: 'Outstanding' },
    remaining: 5,
    status: { name: 'Open' },
    userId: '66511cfa-9ea0-498a-a820-299748197702',
  },
  {
    amount: 10,
    contributors: [],
    feeFineId: 'f2306bef-d9fb-439c-8c65-420a7a86f7a2',
    feeFineOwner: 'TestOwner',
    feeFineType: 'Test Feefine type 1',
    id: '2157711b-4cd6-494e-bf0d-d397ab545400',
    metadata: {
      createdDate: '2022-01-06T04:52:19.214+00:00',
      createdByUserId: '0fc2f695-07f9-5080-817b-364db1480f9e',
      updatedDate: '2022-01-06T04:52:19.214+00:00',
      updatedByUserId: '0fc2f695-07f9-5080-817b-364db1480f9e'
    },
    ownerId: 'a152c90d-e94d-4784-ab4f-4208a0672673',
    paymentStatus: { name: 'Outstanding' },
    remaining: 5,
    status: { name: 'Open' },
    userId: '66511cfa-9ea0-498a-a820-299748197702',
  }
];

const propData = (labelData) => {
  return {
    feeFineActions:  [
      {
        accountId: '2157711b-4cd6-494e-bf0d-d397ab545400',
        amountAction: 5,
        balance: 5,
        comments: 'STAFF : Sample data delete it',
        createdAt: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
        dateAction: '2022-01-06T04:52:19.214+00:00',
        id: 'd003c876-90f1-40da-90bc-a5dd3dedb9c6',
        notify: false,
        source: 'ADMINISTRATOR, DIKU',
        transactionInformation: '',
        typeAction: 'Test Feefine type',
        userId: '66511cfa-9ea0-498a-a820-299748197702',
      }
    ],
    accounts: accountsData,
    onClose: mockFuncClose,
    onChangeAccounts: mockFunc,
    open: true,
    label: labelData,
    intl: { formatMessage : jest.fn() },
  };
};

describe('Warning Modal component', () => {
  afterEach(cleanup);
  it('If payFeeFine modal Renders', () => {
    renderWarningModal(propData('ui-users.accounts.actions.payFeeFine'));
    expect(screen.getByText('ui-users.accounts.actions.payFeeFine')).toBeInTheDocument();
    userEvent.click(screen.getAllByRole('checkbox')[1]);
    userEvent.click(document.querySelector('[id="warning-checkbox"]'), { target: { checked: true } });
    userEvent.click(document.querySelector('[id="warningTransferContinue"]'));
    expect(screen.getByText('Test Feefine type 1')).toBeInTheDocument();
    expect(screen.getByText('Test Feefine type')).toBeInTheDocument();
  });
  it('If waiveFeeFine modal Renders', () => {
    renderWarningModal(propData('ui-users.accounts.actions.waiveFeeFine'));
    expect(screen.getByText('ui-users.accounts.actions.waiveFeeFine')).toBeInTheDocument();
    expect(screen.getByText('Test Feefine type')).toBeInTheDocument();
  });
  it('If transferFeeFine modal Renders', () => {
    renderWarningModal(propData('ui-users.accounts.actions.transferFeeFine'));
    expect(screen.getByText('ui-users.accounts.actions.transferFeeFine')).toBeInTheDocument();
  });
  it('If refundFeeFine modal Renders', () => {
    renderWarningModal(propData('ui-users.accounts.actions.refundFeeFine'));
    expect(screen.getByText('ui-users.accounts.actions.refundFeeFine')).toBeInTheDocument();
  });
});
