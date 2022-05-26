import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import refundTransferClaimReturned from './refundTransferClaimReturned';

const loan = (itemStatusName) => {
  return {
    action: 'recallrequested',
    borrower: { firstName: 'Justen', lastName: 'Hilll', middleName: 'Else', barcode: '344058867767195' },
    dueDate: '2017-03-19T18:32:31.000+00:00',
    feesAndFines: { amountRemainingToPay: 0 },
    id: '40f5e9d9-38ac-458e-ade7-7795bd821652',
    item: {
      id: '1b6d3338-186e-4e35-9e75-1b886b0da53e',
      holdingsRecordId: '65cb2bf0-d4c2-4886-8ad0-b76f1ba75d61',
      instanceId: '7fbd5d84-62d1-44c6-9c45-6cb173998bbd',
      title: "Bridget Jones's Baby: the diaries",
      barcode: '453987605438',
      callNumber: 'PR6056.I4588 B749 2016',
      callNumberComponents: { callNumber: 'PR6056.I4588 B749 2016' },
      contributors: [
        {
          name: 'Fielding, Helen',
        }],
      copyNumber: 'Copy 1',
      location: { name: 'Main Library' },
      materialType: { name: 'book' },
      status: { name: itemStatusName, date: '2021-10-14T03:22:56.490+00:00' },
    },
    itemId: '1b6d3338-186e-4e35-9e75-1b886b0da53e',
    loanDate: '2017-03-05T18:32:31Z',
    loanPolicy: { name: null },
    lostItemPolicy: { name: 'test' },
    lostItemPolicyId: 'test123',
    metadata: { createdDate: '2021-10-14T03:23:01.455+00:00', updatedDate: '2021-10-14T03:23:01.455+00:00' },
    overdueFinePolicy: { name: 'test' },
    overdueFinePolicyId: 'test345',
    renewalCount: 0,
    status: { name: 'Open' },
    userId: '61d2fa07-437c-4805-9332-05ecd11c3e30',
    agedToLostDelayedBilling: {
      lostItemHasBeenBilled : '',
      dateLostItemShouldBeBilled : '',
    },
  };
};

const accounts = [
  {
    amount: 10,
    contributors: [],
    feeFineId: '4b8b116e-e962-4d5d-8ee3-b60c47dc4871',
    feeFineOwner: 'TestOwner',
    feeFineType: 'TestType',
    id: '3f10a1e6-3453-4dc6-bc57-e8b9f205b380',
    metadata: { createdDate: '2021-10-22T07:17:33.305+00:00',
      createdByUserId: '8fcb0de3-9031-54ff-8729-9d8ba9e0cbc2',
      updatedByUserId: '8fcb0de3-9031-54ff-8729-9d8ba9e0cbc2',
      updatedDate: '2021-10-22T07:17:33.305+00:00' },
    ownerId: '19697e4f-0022-489c-ab84-a9171a7ef4f4',
    paymentStatus: { name: 'Suspended claim returned' },
    remaining: 10,
    status: { name: 'Open' },
    userId: '61d2fa07-437c-4805-9332-05ecd11c3e30',
    loanId: '40f5e9d9-38ac-458e-ade7-7795bd821652',
  },
];

const props = (actions) => {
  return {
    mutator: {
      accounts: {
        POST: jest.fn(),
        PUT: jest.fn(() => new Promise((resolve, _) => {
          resolve(accounts);
        })),
        DELETE: jest.fn(),
        cancel: jest.fn(),
        GET: jest.fn(() => new Promise((resolve, _) => {
          resolve(accounts);
        })),
      },
      activeAccount: {
        update: jest.fn(),
      },
      feefineactions: {
        GET: jest.fn(() => new Promise((resolve, _) => {
          resolve(actions);
        })),
        POST: jest.fn(() => new Promise((resolve, _) => {
          resolve(actions);
        })),
      },
      loanstorage: {
        GET: jest.fn(() => new Promise((resolve, _) => {
          resolve(loan('Aged to lost'));
        })),
        PUT: jest.fn(),
      },
      activeLoanStorage: {
        update: jest.fn()
      }
    },
    okapi: {
      currentUser: okapiCurrentUser,
    },
    user: {
      id: okapiCurrentUser.id
    }
  };
};

describe('refundTransferClaimReturned component', () => {
  it('Refund transfer for Aged to lost data', async () => {
    const actions = [{
      loanId: '40f5e9d9-38ac-458e-ade7-7795bd821652',
      status: {
        name: 'Open'
      },
      feeFineType: 'Lost item fee',
      typeAction: 'Transferred',
      transactionInformation: {
        Card: '123345'
      },
      amountAction: 10.0,
      paymentMethod: 'Card',
    },
    ];

    await refundTransferClaimReturned.refundTransfers(loan('Aged to lost'), props(actions));
    expect(refundTransferClaimReturned).toBeDefined();
  });
  it('Refund transfer for Declared lost', async () => {
    const actions = [{
      loanId: '40f5e9d9-38ac-458e-ade7-7795bd821652',
      status: {
        name: 'Open'
      },
      feeFineType: 'Lost item fee',
      typeAction: 'Refund',
      transactionInformation: {
        Card: '123345',
        paymentMethod: 'Card'
      },
      amountAction: 10.0,
      paymentMethod: 'Card',
    },
    ];
    await refundTransferClaimReturned.refundTransfers(loan('Declared lost'), props(actions));
    expect(refundTransferClaimReturned).toBeDefined();
  });
  it('Refund transfer for Declared lost and refund paid', async () => {
    const actions = [{
      loanId: '40f5e9d9-38ac-458e-ade7-7795bd821652',
      status: {
        name: 'Open'
      },
      feeFineType: 'Lost item fee',
      typeAction: 'Paid',
      transactionInformation: {
        Card: '123345',
        paymentMethod: 'Card'
      },
      paymentMethod: 'Card',
    },
    ];
    await refundTransferClaimReturned.refundTransfers(loan('Declared lost'), props(actions));
    expect(refundTransferClaimReturned).toBeDefined();
  });
  it('Refund transfer for Lost and paid', async () => {
    const actions = [{
      loanId: '40f5e9d9-38ac-458e-ade7-7795bd821652',
      status: {
        name: 'Open'
      },
      feeFineType: 'Lost item fee',
      typeAction: 'Refund',
      amountAction: 10.0,
      paymentMethod: 'Card',
    },
    ];
    await refundTransferClaimReturned.refundTransfers(loan('Lost and paid'), props(actions));
    expect(refundTransferClaimReturned).toBeDefined();
  });
});
