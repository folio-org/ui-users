import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

import ModalContent from './ModalContent';

jest.unmock('@folio/stripes/components');

const resources = (records = {}) => {
  return {
    feefineshistory: {
      dataKey: undefined,
      failed: false,
      failedMutations: [],
      hasLoaded: true,
      httpStatus: 200,
      isPending: false,
      module: '@folio/users',
      other: {
        resultInfo: {
          diagnostics: [],
          facets: [],
        },
        totalRecords: 0,
      },
      pendingMutations: [],
      records,
      resource: 'feefineshistory',
      successfulMutations: [],
      throwErrors: true,
      url: 'https://folio-testing-okapi.dev.folio.org/accounts?query=(userId==47f7eaea-1a18-4058-907c-62b7d095c61b)&limit=10000',
    },
  };
};

const mockErrorRespose = () => new Promise((_, reject) => {
  const error = {
    json: () => Promise.resolve(),
    text: () => Promise.resolve(),
    headers: new Headers(),
    error: {
      errors: [
        {
          message: 'error',
        },
      ],
    },
  };
  reject(error);
});

const mutatorSuccess = {
  claimReturned: {
    // eslint-disable-next-line prefer-promise-reject-errors
    POST: () => new Promise((resolve, _) => { resolve(); }),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  markAsMissing: {
    // eslint-disable-next-line prefer-promise-reject-errors
    POST: () => new Promise((resolve, _) => { resolve(); }),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  feefineshistory: {
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  declareLost: {
    // eslint-disable-next-line prefer-promise-reject-errors
    POST: () => new Promise((resolve, _) => { resolve(); }),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  cancel: {
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  activeRecord: {
    replace: jest.fn(),
    update: jest.fn(),
  },

};

const mutator = {
  claimReturned: {
    POST: () => mockErrorRespose(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  markAsMissing: {
    POST: () => mockErrorRespose(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  feefineshistory: {
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  declareLost: {
    POST: () => mockErrorRespose(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  cancel: {
    POST: jest.fn(),
    PUT: jest.fn(),
    DELETE: jest.fn(),
    cancel: jest.fn(),
  },
  activeRecord: {
    replace: jest.fn(),
    update: jest.fn(),
  },

};

const currentUser = {
  addresses: [],
  curServicePoint: {
    id: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
    name: 'Online',
    code: 'Online',
    discoveryDisplayName: 'Online',
    shelvingLagTime: 0,
    pickupLocation: false,
    locationIds: [],
    metadata: { createdDate: '2021-10-14T03:22:53.897+00:00', updatedDate: '2021-10-14T03:22:53.897+00:00' },
    staffSlips: [],
  },
  email: 'admin@diku.example.org',
  firstName: 'DIKU',
  id: 'a51df26e-b472-5c06-8362-01025b90238b',
  lastName: 'ADMINISTRATOR',
  servicePoints: [
    {
      code: 'Online',
      discoveryDisplayName: 'Online',
      id: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
      locationIds: [],
      metadata: { createdDate: '2021-10-14T03:22:53.897+00:00', updatedDate: '2021-10-14T03:22:53.897+00:00' },
      name: 'Online',
      pickupLocation: false,
      shelvingLagTime: 0,
      staffSlips: [],
    },
    {
      code: 'cd2',
      discoveryDisplayName: 'Circulation Desk -- Back Entrance',
      holdShelfExpiryPeriod: { duration: 5, intervalId: 'Days' },
      id: 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
      locationIds: [],
      metadata: { createdDate: '2021-10-14T03:22:53.906+00:00', updatedDate: '2021-10-14T03:22:53.906+00:00' },
      name: 'Circ Desk 2',
      pickupLocation: true,
      staffSlips: [],
    },
    {
      code: 'cd1',
      discoveryDisplayName: 'Circulation Desk -- Hallway',
      holdShelfExpiryPeriod: { duration: 3, intervalId: 'Weeks' },
      id: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
      locationIds: [],
      metadata: { createdDate: '2021-10-14T03:22:53.912+00:00', updatedDate: '2021-10-14T03:22:53.912+00:00' },
      name: 'Circ Desk 1',
      pickupLocation: true,
      staffSlips: [],
    },
  ],
  username: 'diku_admin',
};

const loan = (actionName) => {
  return {
    action: actionName,
    borrower: { firstName: 'Justen', lastName: 'Hilll', middleName: 'Else', barcode: '344058867767195' },
    dueDate: '2017-03-19T18:32:31.000+00:00',
    feesAndFines: {
      amountRemainingToPay: 0,
    },
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
      status: { name: 'Checked out', date: '2021-10-14T03:22:56.490+00:00' },
    },
    itemId: '1b6d3338-186e-4e35-9e75-1b886b0da53e',
    loanDate: '2017-03-05T18:32:31Z',
    loanPolicy: { name: null },
    lostItemPolicy: { name: null },
    metadata: { createdDate: '2021-10-14T03:23:01.455+00:00', updatedDate: '2021-10-14T03:23:01.455+00:00' },
    overdueFinePolicy: { name: null },
    renewalCount: 0,
    status: { name: 'Open' },
    userId: '47f7eaea-1a18-4058-907c-62b7d095c61b',
  };
};

const renderModalContent = (props) => render(<ModalContent {...props} />);

describe('Modal Content', () => {
  const commonProps = {
    isLoading: false,
    declarationInProgress: false,
    resources: {},
    mutator,
    loanAction: 'declareLost',
    itemRequestCount: 0,
    activeRecord: {},
    onClose: jest.fn(),
    handleError: jest.fn(),
    toggleButton: jest.fn(),
    validateAction: jest.fn(),
    okapi: {
      url: 'https://folio-testing-okapi.dev.folio.org',
      tenant: 'diku',
      okapiReady: true,
      authFailure: [],
      bindings: {},
      currentUser
    },
  };

  it('Declare Lost Confirm Dialog box', async () => {
    const actionName = 'recallrequested';
    const props = {
      ...commonProps,
      loan: loan(actionName),
    };
    renderModalContent(props);
    expect(screen.getByText('ui-users.loans.declareLostDialogBody')).toBeDefined();

    fireEvent.change(document.querySelector('[data-test-additional-info-textarea="true"]'), { target: {
      value: 'test'
    } });

    fireEvent.click(document.querySelector('[data-test-dialog-confirm-button="true"]'));
  });

  it('Cancel Dialog box', async () => {
    const actionName = 'recallrequested';
    const props = {
      ...commonProps,
      loan: loan(actionName),
    };
    renderModalContent(props);
    expect(screen.getByText('ui-users.loans.declareLostDialogBody')).toBeDefined();

    fireEvent.change(document.querySelector('[data-test-additional-info-textarea="true"]'), { target: {
      value: 'test'
    } });

    fireEvent.click(document.querySelector('[data-test-dialog-cancel-button="true"]'));
  });

  it('ClaimedReturn confirm dialog box', async () => {
    const actionName = 'recallrequested';
    const props = {
      ...commonProps,
      loan: loan(actionName),
      loanAction: 'claimReturned',
    };
    renderModalContent(props);
    expect(screen.getByText('ui-users.loans.claimReturnedDialogBody')).toBeDefined();

    fireEvent.change(document.querySelector('[data-test-additional-info-textarea="true"]'), { target: {
      value: 'test'
    } });
    fireEvent.click(document.querySelector('[data-test-dialog-confirm-button="true"]'));
  });

  it('Claimed return for missing item check', async () => {
    const actionName = 'claimedReturned';
    const props = {
      ...commonProps,
      loan: loan(actionName),
      loanAction: 'markAsMissing',
      user: {
        id: '47f7eaea-1a18-4058-907c-62b7d095c61b',
      },
    };
    renderModalContent(props);
    expect(screen.getByText('ui-users.loans.markAsMissingDialogBody')).toBeDefined();

    fireEvent.change(document.querySelector('[data-test-additional-info-textarea="true"]'), { target: {
      value: 'test'
    } });

    fireEvent.click(document.querySelector('[data-test-dialog-confirm-button="true"]'));
  });

  it('Claimed return for Lost item check', async () => {
    const record = [
      {
        loanId: '40f5e9d9-38ac-458e-ade7-7795bd821652',
        status: {
          name: 'Open'
        },
        feeFineType: 'Lost item fee',
      }];
    const actionName = 'claimedReturned';
    const props = {
      ...commonProps,
      resources: resources(record),
      loan: loan(actionName),
    };
    renderModalContent(props);
    expect(screen.getByText('ui-users.loans.declareLostDialogBody')).toBeDefined();

    fireEvent.change(document.querySelector('[data-test-additional-info-textarea="true"]'), { target: {
      value: 'test'
    } });

    fireEvent.click(document.querySelector('[data-test-dialog-confirm-button="true"]'));
  });

  it('Check if users have open fine', async () => {
    const record = [
      {
        loanId: '40f5e9d9-38ac-458e-ade7-7795bd821652',
        status: {
          name: 'Open'
        },
        feeFineType: 'Lost item processing fee',
      }];
    const actionName = 'claimedReturned';
    const props = {
      ...commonProps,
      resources: resources(record),
      loan: loan(actionName),
    };
    renderModalContent(props);
    expect(screen.getByText('ui-users.loans.declareLostDialogBody')).toBeDefined();

    fireEvent.change(document.querySelector('[data-test-additional-info-textarea="true"]'), { target: {
      value: 'test'
    } });

    fireEvent.click(document.querySelector('[data-test-dialog-confirm-button="true"]'));
  });

  it('Checking if the user has closed fine', async () => {
    const record = [{
      loanId: '40f5e9d9-38ac-458e-ade7-7795bd821652',
      status: {
        name: 'Closed'
      },
      feeFineType: 'Lost item processing fee',
    }];
    const actionName = 'claimedReturned';
    const props = {
      ...commonProps,
      resources: resources(record),
      mutator: mutatorSuccess,
      loan: loan(actionName),
    };
    renderModalContent(props);
    expect(screen.getByText('ui-users.loans.declareLostDialogBody')).toBeDefined();

    fireEvent.change(document.querySelector('[data-test-additional-info-textarea="true"]'), { target: {
      value: 'test'
    } });

    fireEvent.click(document.querySelector('[data-test-dialog-confirm-button="true"]'));
  });
});
