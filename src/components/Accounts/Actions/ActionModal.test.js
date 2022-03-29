import { act, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import ActionModal from './ActionModal';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderActionModal = (props) => renderWithRouter(<ActionModal {...props} />);

const propData = (accountsData, actionData, data = []) => {
  return {
    form: {},
    onClose: jest.fn(),
    handleSubmit: jest.fn(),
    onSubmit: jest.fn(),
    open: true,
    accounts: accountsData,
    feeFineActions: [
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
    data,
    balance: '5.00',
    totalPaidAmount: '0.00',
    owedAmount: '0.00',
    submitting: false,
    pristine: true,
    reset: jest.fn(),
    commentRequired: true,
    owners: [
      {
        id: 'a152c90d-e94d-4784-ab4f-4208a0672673',
        metadata: {
          createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
          createdDate: '2021-12-27T12:08:53.639+00:00',
          updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
          updatedDate: '2021-12-27T12:09:22.973+00:00',
        },
        owner: 'TestOwner',
        servicePointOwner: [
          {
            label: 'Online',
            value: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
          }
        ]
      },
      {
        id: '6f7577f6-5acf-4cd1-9470-54b40153c1d7',
        metadata: {
          createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
          createdDate: '2021-12-27T12:08:53.639+00:00',
          updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
          updatedDate: '2021-12-27T12:09:22.973+00:00',
        },
        owner: 'test1',
        servicePointOwner: []
      }
    ],
    label: 'nameMethod',
    action: actionData,
    intl: { formatMessage : jest.fn() },
    checkAmount: 'check-pay',
    okapi: {
      url: 'https://folio-testing-okapi.dev.folio.org',
      tenant: 'diku',
      okapiReady: true,
      authFailure: [],
      bindings: {},
    },
    initialValues: {
      amount: '5.00',
      notify: true,
      ownerId: 'a152c90d-e94d-4784-ab4f-4208a0672673',
    },
  };
};

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
  }
];

describe('ActionModal component', () => {
  describe('Checking if modal renders for', () => {
    it('payment', async () => {
      const accountsDataSingle = [
        {
          amount: 1,
          contributors: [],
          feeFineId: '60c40e4d-250e-49ff-8fd2-acd4739e9c7d',
          feeFineOwner: 'TestOwner',
          feeFineType: 'Test Feefine type',
          id: '2f275ea4-14b4-401e-835e-2d46cfb50bca',
          metadata: {
            createdDate: '2022-01-06T04:52:19.214+00:00',
            createdByUserId: '0fc2f695-07f9-5080-817b-364db1480f9e',
            updatedDate: '2022-01-06T04:52:19.214+00:00',
            updatedByUserId: '0fc2f695-07f9-5080-817b-364db1480f9e'
          },
          ownerId: 'a152c90d-e94d-4784-ab4f-4208a0672673',
          paymentStatus: { name: 'Outstanding' },
          remaining: 1,
          status: { name: 'Open' },
          userId: '2205005b-ca51-4a04-87fd-938eefa8f6de',
        }
      ];
      const data = [{
        ownerId : 'a152c90d-e94d-4784-ab4f-4208a0672673',
        label: 'TestLabel',
        id: '1234567890abcdefgh'
      }];
      await waitFor(() => renderActionModal(propData(accountsDataSingle, 'payment', data)));
      await act(async () => userEvent.clear(document.querySelector('[id="amount"]')));
      await act(async () => userEvent.type(document.querySelector('[id="amount"]'), '2.00'));
      userEvent.click(screen.getByText('ui-users.cancel'));
      await waitFor(() => expect(screen.getByText('ui-users.accounts.payment.field.transactionInfo')).toBeTruthy());
    });
    it('transfer', async () => {
      await waitFor(() => renderActionModal(propData(accountsData, 'transfer')));
      userEvent.selectOptions(document.querySelector('[id="ownerId"]'), screen.getByText('test1'));
      expect(screen.getByText('ui-users.accounts.payment.field.ownerDesk*')).toBeTruthy();
    });
    it('multiple payments', async () => {
      await waitFor(() => renderActionModal(propData(accountsData, 'paymany')));
      expect(screen.getByText('ui-users.accounts.payment.field.transactionInfo')).toBeTruthy();
    });
    it('refund', async () => {
      await waitFor(() => renderActionModal(propData(accountsData, 'refund')));
      expect(screen.getByText('ui-users.accounts.otherOwed:')).toBeTruthy();
    });
  });
});
