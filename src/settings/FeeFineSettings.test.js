import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import { buildResources } from 'helpers/buildResources';
import FeeFineSettings from './FeeFineSettings';
import { SHARED_OWNER } from '../constants';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');


const feefines = [
  {
    'automatic' : true,
    'feeFineType' : 'Lost item fee',
    'id' : 'cf238f9f-7018-47b7-b815-bb2db798e19f'
  }, {
    'automatic' : true,
    'feeFineType' : 'Lost item fee (actual cost)',
    'id' : '73785370-d3bd-4d92-942d-ae2268e02ded'
  }, {
    'automatic' : true,
    'feeFineType' : 'Lost item processing fee',
    'id' : 'c7dede15-aa48-45ed-860b-f996540180e0'
  }, {
    'automatic' : true,
    'feeFineType' : 'Overdue fine',
    'id' : '9523cb96-e752-40c2-89da-60f3961a488d'
  }, {
    'automatic' : true,
    'feeFineType' : 'Replacement processing fee',
    'id' : 'd20df2fb-45fd-4184-b238-0d25747ffdd9'
  }, {
    'automatic' : false,
    'feeFineType' : 'TestFeeFine',
    'defaultAmount' : 1.0,
    'ownerId' : '6b3884f3-8066-47a7-b44e-5adcd6350d61',
    'metadata' : {
      'createdDate' : '2022-01-11T13:17:33.422+00:00',
      'createdByUserId' : '279cec9f-1ae5-50b2-bd65-cfd0803fc9a9',
      'updatedDate' : '2022-01-11T13:17:33.422+00:00',
      'updatedByUserId' : '279cec9f-1ae5-50b2-bd65-cfd0803fc9a9'
    },
    'id' : 'ec1b5df0-9eab-490b-86ef-ebaa3bbd0193'
  }
];

const resources = buildResources({
  resourceName: ['values'],
  updaterName: ['updaters'],
  records: feefines
});

const ownerData = [
  {
    id: '6b3884f3-8066-47a7-b44e-5adcd6350d61',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test2',
    servicePointOwner: []
  },
  {
    id: '6b3884f3-8066-47a7-b44e-5adcd6350d63',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: 'test1',
    servicePointOwner: []
  },
  {
    id: '6f7577f6-5acf-4cd1-9470-54b40153c1d7',
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    owner: SHARED_OWNER,
    servicePointOwner: []
  }
];

const templateData = [
  {
    'id' : 'd7670649-9d35-4e41-8a6b-ca46a271f893',
    'outputFormats' : ['text/html'],
    'templateResolver' : 'mustache',
    'localizedTemplates' : {
      'en' : {
        'header' : 'Julies 331 Lost item fee(s), charged - Upon/at - charge',
        'body' : '<div><span style="font-size: 32px;">User</span></div><div><strong>user.firstName = {{user.firstName}}</strong></div><div>user.lastName = {{user.lastName}}</div><div>user.middleName = {{user.middleName}}</div><div><strong>user.barcode = {{user.barcode}}</strong></div><div>user.barcodeImage = {{user.barcodeImage}}</div><div><br></div><div><span style="font-size: 32px;">Item</span></div><div><strong>item.title = {{item.title}}</strong></div><div>item.primaryContributor = {{item.primaryContributor}}</div><div>item.allContributors = {{item.allContributors}}</div><div><strong>item.barcode = {{item.barcode}}</strong></div><div>item.barcodeImage = {{item.barcodeImage}}</div><div>item.callNumber = {{item.callNumber}}</div><div>item.callNumberPrefix = {{item.callNumberPrefix}}</div><div>item.callNumberSuffix = {{item.callNumberSuffix}}</div><div>item.enumeration = {{item.enumeration}}</div><div>item.volume = {{item.volume}}</div><div>item.chronology = {{item.chronology}}</div><div>item.yearCaption = {{item.yearCaption}}</div><div>item.materialType = {{item.materialType}}</div><div>item.copy = {{item.copy}}</div><div>item.numberOfPieces = {{item.numberOfPieces}}</div><div>item.descriptionOfPieces = {{item.descriptionOfPieces}}</div><div><br></div><div><span style="font-size: 32px;">Effective Location</span></div><div><strong>item.effective.LocationSpecific = {{item.effectiveLocationSpecific}}</strong></div><div>item.effective.LocationLibrary = {{item.effectiveLocationLibrary}}</div><div>item.effective.LocationCampus = {{item.effectiveLocationCampus}}</div><div>item.effectiveLocationInstitution = {{item.effectiveLocationInstitution}}</div><div><br></div><div><span style="font-size: 32px;">Loan</span></div><div>loan.dueDate = {{loan.dueDate}}</div><div><strong>loan.dueDateTime = {{loan.dueDateTime}}</strong></div><div>loan.initialBorrowDate = {{loan.initialBorrowDate}}</div><div>loan.initialBorrowDateTime = {{loan.initialBorrowDateTime}}</div><div>loan.checkedInDate = {{loan.checkedInDate}}</div><div>loan.checkedInDateTime = {{loan.checkedInDateTime}}</div><div>loan.numberOfRenewalsAllowed = {{loan.numberOfRenewalsAllowed}}</div><div>loan.numberOfRenealsTaken = {{loan.numberOfRenewalsTaken}}</div><div>loan.numberOfRenewalsRemaining = {{loan.numberOfRenewalsRemaining}}</div><div><br></div><div><span style="font-size: 32px;">Fee/fine Charge</span></div><div>feeCharge.owner = {{feeCharge.owner}}</div><div><strong>feeCharge.type = {{feeCharge.type}}</strong></div><div>feeCharge.paymentStatus = {{feeCharge.paymentStatus}}</div><div>feeCharge.chargeDate = {{feeCharge.chargeDate}}</div><div>feeCharge.chargeDateTime = {{feeCharge.chargeDateTime}}</div><div><strong>feeCharge.amount = {{feeCharge.amount}}</strong></div><div>feeCharge.remainingAmount = {{feeCharge.remainingAmount}}</div>',
        'attachments' : []
      }
    },
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: '279cec9f-1ae5-50b2-bd65-cfd0803fc9a9',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    'name' : 'charge Action Test',
    'active' : true,
    'category' : 'FeeFineAction'
  },
  {
    'id' : 'd7670649-9d35-4e41-8a6b-ca46a271f892',
    'outputFormats' : ['text/html'],
    'templateResolver' : 'mustache',
    'localizedTemplates' : {
      'en' : {
        'header' : 'Julies 331 Lost item fee(s), Action - Upon/at - charge',
        'body' : '<div><span style="font-size: 32px;">User</span></div><div><strong>user.firstName = {{user.firstName}}</strong></div><div>user.lastName = {{user.lastName}}</div><div>user.middleName = {{user.middleName}}</div><div><strong>user.barcode = {{user.barcode}}</strong></div><div>user.barcodeImage = {{user.barcodeImage}}</div><div><br></div><div><span style="font-size: 32px;">Item</span></div><div><strong>item.title = {{item.title}}</strong></div><div>item.primaryContributor = {{item.primaryContributor}}</div><div>item.allContributors = {{item.allContributors}}</div><div><strong>item.barcode = {{item.barcode}}</strong></div><div>item.barcodeImage = {{item.barcodeImage}}</div><div>item.callNumber = {{item.callNumber}}</div><div>item.callNumberPrefix = {{item.callNumberPrefix}}</div><div>item.callNumberSuffix = {{item.callNumberSuffix}}</div><div>item.enumeration = {{item.enumeration}}</div><div>item.volume = {{item.volume}}</div><div>item.chronology = {{item.chronology}}</div><div>item.yearCaption = {{item.yearCaption}}</div><div>item.materialType = {{item.materialType}}</div><div>item.copy = {{item.copy}}</div><div>item.numberOfPieces = {{item.numberOfPieces}}</div><div>item.descriptionOfPieces = {{item.descriptionOfPieces}}</div><div><br></div><div><span style="font-size: 32px;">Effective Location</span></div><div><strong>item.effective.LocationSpecific = {{item.effectiveLocationSpecific}}</strong></div><div>item.effective.LocationLibrary = {{item.effectiveLocationLibrary}}</div><div>item.effective.LocationCampus = {{item.effectiveLocationCampus}}</div><div>item.effectiveLocationInstitution = {{item.effectiveLocationInstitution}}</div><div><br></div><div><span style="font-size: 32px;">Loan</span></div><div>loan.dueDate = {{loan.dueDate}}</div><div><strong>loan.dueDateTime = {{loan.dueDateTime}}</strong></div><div>loan.initialBorrowDate = {{loan.initialBorrowDate}}</div><div>loan.initialBorrowDateTime = {{loan.initialBorrowDateTime}}</div><div>loan.checkedInDate = {{loan.checkedInDate}}</div><div>loan.checkedInDateTime = {{loan.checkedInDateTime}}</div><div>loan.numberOfRenewalsAllowed = {{loan.numberOfRenewalsAllowed}}</div><div>loan.numberOfRenealsTaken = {{loan.numberOfRenewalsTaken}}</div><div>loan.numberOfRenewalsRemaining = {{loan.numberOfRenewalsRemaining}}</div><div><br></div><div><span style="font-size: 32px;">Fee/fine Charge</span></div><div>feeCharge.owner = {{feeCharge.owner}}</div><div><strong>feeCharge.type = {{feeCharge.type}}</strong></div><div>feeCharge.paymentStatus = {{feeCharge.paymentStatus}}</div><div>feeCharge.chargeDate = {{feeCharge.chargeDate}}</div><div>feeCharge.chargeDateTime = {{feeCharge.chargeDateTime}}</div><div><strong>feeCharge.amount = {{feeCharge.amount}}</strong></div><div>feeCharge.remainingAmount = {{feeCharge.remainingAmount}}</div>',
        'attachments' : []
      }
    },
    metadata: {
      createdByUserId: 'e1130416-f25f-5929-8c1d-b33d3f50f414',
      createdDate: '2021-12-27T12:08:53.639+00:00',
      updatedByUserId: '279cec9f-1ae5-50b2-bd65-cfd0803fc9a9',
      updatedDate: '2021-12-27T12:09:22.973+00:00',
    },
    'name' : 'Charge test',
    'active' : true,
    'category' : 'FeeFineCharge'
  }
];
const mutator = {
  activeRecord: {
    update: jest.fn(),
  },
  updaterIds: {
    replace: jest.fn(),
    update: jest.fn(),
    GET: jest.fn(),
  },
  feefines: {
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
    reset: jest.fn(),
  },
  owners: {
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
    reset: jest.fn(),
    GET: jest.fn().mockResolvedValue(ownerData),
  },
  values:{
    DELETE: jest.fn().mockReturnValue(Promise.resolve()),
    POST: jest.fn(),
    PUT: jest.fn(),
    cancel: jest.fn(),
  },
  templates:{
    GET: jest.fn().mockResolvedValue(templateData),
  }
};

const localResources = {
  feefines: {
    records: feefines,
  },
  owners: {
    records: ownerData,
  },
  templates: {
    records: templateData,
  }
};

const propData = {
  stripes: {
    connect: (Component) => props => <Component {...props} resources={resources} mutator={mutator} />,
    hasPerm: jest.fn().mockResolvedValue(true),
  },
  resources: localResources,
  mutator,
  match: { path: '/settings/users/feefinestable' },
  location: { pathname: '/settings/users/feefinestable' },
  intl: {},
  okapi: {
    url: 'https://folio-testing-okapi.dev.folio.org',
    tenant: 'diku',
    okapiReady: true,
    authFailure: [],
    bindings: {},
  },
};


const renderFeeFineSettings = async (props) => renderWithRouter(<FeeFineSettings {...props} />);

describe('Payment settings', () => {
  beforeEach(async () => {
    await waitFor(() => renderFeeFineSettings(propData));
  });
  it('component must be rendered', async () => {
    expect(screen.getAllByText('ui-users.feefines.title')[0]).toBeTruthy();
  });
  it('Onchange owner', async () => {
    userEvent.selectOptions(document.querySelector('[id="select-owner"]'), screen.getByText('test2'));
    userEvent.selectOptions(document.querySelector('[id="select-owner"]'), screen.getByText(SHARED_OWNER));
    expect(screen.getByText('test2')).toBeTruthy();
  });
  it('OnChange payment', async () => {
    userEvent.click(document.querySelector('[id="charge-notice-primary"]'));
    userEvent.selectOptions(document.querySelector('[name="defaultChargeNoticeId"]'), screen.getByText('Charge test'));
    userEvent.selectOptions(document.querySelector('[name="defaultActionNoticeId"]'), screen.getByText('charge Action Test'));
    userEvent.click(document.querySelector('[id="charge-notice-primary"]'));
    userEvent.selectOptions(document.querySelector('[id="select-owner"]'), screen.getByText('test1'));
    userEvent.selectOptions(document.querySelector('[name="ownerId"]'), screen.getAllByText('test2')[1]);
    userEvent.click(screen.getByText('ui-users.feefines.modal.submit'));
    expect(screen.getAllByText('test2')[1]).toBeTruthy();
  });
  it('Create payment', async () => {
    userEvent.click(document.querySelector('[id="clickable-add-settings-feefines"]'));
    userEvent.type(document.querySelector('[name="items[0].defaultAmount"]'), '1.0');
    // missing field validation
    userEvent.click(document.querySelector('[id="clickable-save-settings-feefines-0"]'));
    userEvent.type(document.querySelector('[name="items[0].feeFineType"]'), 'feefinetype');
    // NAN validation
    userEvent.type(document.querySelector('[name="items[0].defaultAmount"]'), 'abc');
    userEvent.click(document.querySelector('[id="clickable-save-settings-feefines-0"]'));
    // less than zero validation
    userEvent.type(document.querySelector('[name="items[0].defaultAmount"]'), '-1');
    userEvent.click(document.querySelector('[id="clickable-save-settings-feefines-0"]'));
    expect(screen.getByText('stripes-core.button.save')).toBeTruthy();
  });
});
