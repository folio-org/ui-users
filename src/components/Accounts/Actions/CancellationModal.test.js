import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import CancellationModal from './CancellationModal';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderCancellationModal = (props) => renderWithRouter(<CancellationModal {...props} />);

const onCloseMock = jest.fn();

const propData = (accountData = {}) => {
  return {
    form: {},
    pristine: true,
    submitting: true,
    onClose: onCloseMock,
    handleSubmit: jest.fn(),
    onSubmit: jest.fn(),
    open: true,
    reset: jest.fn(),
    account: accountData,
    feefines: [
      {
        accountId: '2157711b-4cd6-494e-bf0d-d397ab545400',
        amountAction: 5,
        balance: 5,
        comments: 'STAFF : Sample data delete it',
        createdAt: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
        dateAction: '2022-01-06T04:52:19.214+00:00',
        id: 'd003c876-90f1-40da-90bc-a5dd3dedb9c6',
        notify: true,
        source: 'ADMINISTRATOR, DIKU',
        transactionInformation: '',
        typeAction: 'Test Feefine type',
        userId: '66511cfa-9ea0-498a-a820-299748197702',
      }
    ],
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
        defaultActionNoticeId: 'test123id',
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
    intl: { formatMessage : jest.fn() },
    okapi: {
      url: 'https://folio-testing-okapi.dev.folio.org',
      tenant: 'diku',
      okapiReady: true,
      authFailure: [],
      bindings: {},
    },
  };
};


const accountData = {
  contributors: [],
  feeFineId: 'f2306bef-d9fb-439c-8c65-420a7a86f7a2',
  feeFineOwner: 'TestOwner',
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
};

describe('CancellationModal component', () => {
  beforeEach(() => {
    renderCancellationModal(propData(accountData));
  });
  it('Check if modal Renders', () => {
    expect(screen.getByText('ui-users.accounts.cancellation.field.confirmcancelled')).toBeInTheDocument();
  });
  it('Onclose modal check', () => {
    userEvent.click(document.querySelector('[id="error-modal-close-button"]'));
    expect(onCloseMock).toHaveBeenCalled();
  });
  it('Comment check', () => {
    userEvent.type(document.querySelector('[id="textarea-input-5"]'), 'TestComment');
    expect(screen.getByText('TestComment')).toBeInTheDocument();
  });
  it('Notify Patron check', () => {
    userEvent.click(document.querySelector('[id="checkbox-8"]'));
    expect(screen.getByText('ui-users.accounts.field.infoPatron')).toBeInTheDocument();
  });
  it('Empty accounts data check', () => {
    renderCancellationModal(propData());
    expect(screen.getAllByText('ui-users.accounts.cancellation.feeFinewillBeCancelled')[0]).toBeInTheDocument();
  });
});
