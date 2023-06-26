import React from 'react';
import userEvent from '@testing-library/user-event';
import {
  screen, waitFor
} from '@testing-library/react';
import {
  IfInterface,
  IfPermission,
} from '@folio/stripes/core';
import '__mock__';
import '__mock__/matchMedia.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import translationProperties from 'helpers/translationProperties';
import UserSearch from './UserSearch';

jest.unmock('@folio/stripes/components');

const data = {
  startDate: '2022-01-01',
  endDate: '2022-01-31',
  servicePoint: [
    {
      id: '1',
      name: 'servicePoint1',
    }
  ]
};

const dataDefault = {
  startDate: '2022-01-01',
  endDate: '2022-01-31',
  servicePoint: [
    {
      id: '1',
      name: 'servicePoint1',
    }
  ],
  sources: [
    { id: '1', label: 'source1' }
  ],
  format: ''
};
const data2 = {
  startDate: '2022-01-01',
  endDate: '2022-01-31',
  servicePoint: [
    {
      id: '1',
      name: 'servicePoint1',
    }
  ],
  sources: [
    { id: '2', label: 'source2' }
  ],
  format: 'both'
};
const data3 = {
  startDate: '2022-01-01',
  endDate: '2022-01-31',
  servicePoint: [
    {
      id: '1',
      name: 'servicePoint1',
    }
  ],
  sources: [
    { id: '3', label: 'source3' }
  ],
  format: 'pdf'
};
const data4 = {
  startDate: '2022-01-01',
  endDate: '2022-01-31',
  servicePoint: [
    {
      id: '1',
      name: 'servicePoint1',
    }
  ],
  sources: [
    { id: '4', label: 'source4' }
  ],
  format: 'csv',
};

jest.mock('../../components/ReportModals/CashDrawerReportModal', () => (prop) => <div> <span>{prop.label}</span> <button type="button" onClick={() => prop.onClose()}>onClose</button><button type="button" onClick={() => prop.onSubmit(dataDefault)}>onSubmit</button><button type="button" onClick={() => prop.onSubmit(data2)}>onSubmitBothFormat</button><button type="button" onClick={() => prop.onSubmit(data3)}>onSubmitPdfFormat</button><button type="button" onClick={() => prop.onSubmit(data4)}>onSubmitCsvFormat</button></div>);
jest.mock('../../components/LostItemsLink', () => jest.fn().mockReturnValue('LostItemsLink'));
jest.mock('../../components/CustomFieldsFilters/CustomFieldsFilters', () => jest.fn().mockReturnValue('CustomFieldsFilters'));
jest.mock('../../components/ReportModals/FinancialTransactionsReportModal', () => (prop) => <div> <span>{prop.label}</span> <button type="button" onClick={() => prop.onClose()}>onClose</button><button type="button" onClick={() => prop.onSubmit(data)}>onSubmit</button></div>);

const props = {
  contentRef: {},
  history: { push: jest.fn() },
  idPrefix: 'users-',
  initialSearch: 'test3',
  intl: { formatMessage: jest.fn() },
  location: {
    pathname: '/users/preview/:id'
  },
  match: { path: '/users/preview/:id', params: { id: '/users/preview/:id', loanstatus: 'open' }, urlParams: { params: { id: '/users/preview/:id' } } },
  onComponentWillUnmount: jest.fn(),
  onNeedMoreData: jest.fn(),
  queryGetter: jest.fn(),
  querySetter: jest.fn(),
  resources: {
    users: {
      records: [
        { id: 'record1', name: 'user1' },
        { id: 'record2', name: 'user2' },
        { id: 'record3', name: 'user3' },
      ],
      isPending: true,
      hasLoaded: true,
    },
    records: {
      id: '21',
      name: 'test66',
      isPending: true,
      records: [
        { id: '4', personal: { firstName: 'John', lastName: 'Doe', middleName: '', preferredFirstName: 'John_Doe' } },
        { id: '5', personal: { firstName: 'Jane', lastName: 'Do', middleName: '', preferredFirstName: 'Jane_Do' } },
        { id: '6', personal: { firstName: 'Bob', lastName: 'Smith', middleName: '', preferredFirstName: 'Bob_Smith' } },
      ],
    },
    patronGroups: {
      filter: jest.fn(),
      resource: 'patronGroups',
      records: [{
        filter: jest.fn(),
        desc: 'Staff Member',
        expirationOffsetInDays: 730,
        group: 'staff',
        id: '3684a786-6671-4268-8ed0-9db82ebca60b'
      },
      {
        filter: jest.fn(),
        desc: 'students',
        expirationOffsetInDays: 730,
        group: 'students',
        id: '223344444'
      }],
    },
    departments: {},
    owners: {
      feeFineOwner: {
        id: 'feeFineOwnerid1',
        owner: 'feeFineOwner1',
      },
      records: [
        {
          id: 'id-owner1',
          owner: 'Owner1',
          servicePointOwner: [
            {
              label: 'Circ Desk 1',
              value: 'id2'
            },
            {
              label: 'Circ Desk 2',
              value: 'id3',
            }
          ]
        },
        {
          id: 'id-owner2',
          owner: 'Owner2',
          servicePointOwner: [
            {
              label: 'Online',
              value: 'id1'
            }
          ]
        }
      ],
      id: '109155d9-3b60-4a3d-a6b1-066cf1b1356b',
      owner: 'test',
      metadata: {
        createdDate: '2022-03-01T03:22:48.262+00:00',
        updatedDate: '2022-03-01T03:22:48.262+00:00'
      },
      servicePointOwner: [
        {
          label: 'Online',
          value: 'id1'
        }
      ],
      defaultChargeNoticeId: '109155e9-3b60-4a3d-a6b1-066cf1b1356b'
    },
    servicePointsUsers: {
      servicePointsValue: 'test11',
      createdAt: {
        servicePointsValue: 'test11'
      }
    },
    query: {
      qindex: 'test3'
    }
  },
  mutator: {
    loans: {
      view: 'loanoverdue',
      name: 'loan1',
      id: 'loanid1',
      GET: jest.fn().mockReturnValueOnce([{ id: 'testid', title:'csvreport' }]),
      reset: jest.fn(),
    },
    resultOffset: {
      GET: jest.fn(),
      POST: jest.fn(),
      replace: jest.fn(),
      update: jest.fn(),
    },
    query: {
      sort: jest.fn(),
      update: jest.fn(),
    },
    refundsReport: {
      POST: jest.fn().mockReturnValue({ reportData: { startDate: '2022-01-01', endDate: '2022-01-31', feeFineOwners: { ids: '1', owner: 'owner1' } } })
    },
    cashDrawerReport: {
      POST: jest.fn().mockReturnValue({ reportData: { id: 'report1' } })
    },
    cashDrawerReportSources: {
      GET: jest.fn(),
      POST: jest.fn(),
    },
    financialTransactionsReport: {
      POST: jest.fn().mockReturnValue({ reportData: { startDate: '2022-01-01', endDate: '2022-01-31', feeFineOwner: { id: '1', owner: 'owner1', ownerValue: 'test111' } } })
    }
  },
  okapi: {
    currentUser: {
      servicePoints: [
        {
          servicePoint: {
            value: 'servicePoint1',
            label: 'servicePointlabel'
          },
          id: 'servicePointid1',
          value: 'servicePoint1',
          label: 'servicePointlabel'
        }
      ]
    },
  },
  source: {
    totalCount: jest.fn(),
    loaded: jest.fn(),
  },
  stripes: {
    connect: (Component) => Component,
    setTimezone: jest.fn(),
    hasInterface: () => true,
    hasPerm: jest.fn().mockReturnValue(true),
    timezone: 'UTC',
  }
};

const renderUserSearch = (extraProps = {}) => renderWithRouter(
  <UserSearch {...props} {...extraProps} />,
  translationProperties
);

describe('Render UserSearch component', () => {
  beforeEach(() => {
    IfPermission.mockImplementation(({ children }) => children);
    IfInterface.mockImplementation(({ children }) => children);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Check if Search are shown and hide', async () => {
    renderUserSearch();
    expect(screen.getByText('ui-users.userSearch')).toBeInTheDocument();
    expect(screen.getByText('stripes-components.searchFieldIndex')).toBeInTheDocument();
    expect(screen.getByText('stripes-smart-components.hideSearchPane')).toBeInTheDocument();

    const hideSearchPane = screen.getByRole('button', { name: 'stripes-smart-components.hideSearchPane' });
    userEvent.click(hideSearchPane);

    expect(screen.getByText('stripes-smart-components.showSearchPane')).toBeInTheDocument();

    const showSearchPane = screen.getByRole('button', { name: 'stripes-smart-components.showSearchPane' });
    userEvent.click(showSearchPane);

    expect(screen.getByText('stripes-smart-components.hideSearchPane')).toBeInTheDocument();
  });

  it('Search button to be enbled when enter input values', () => {
    renderUserSearch();
    const userSearch = document.querySelector('[id="input-user-search"]');
    userEvent.type(userSearch, 'record1');
    expect(document.querySelector('[id="submit-user-search"]')).not.toHaveAttribute('disabled');
  });

  it('clickable filter active, inactive check box should be checked and when selecting options to be truthy', () => {
    renderUserSearch();

    const inputElementcheckbox = document.querySelector('[id="clickable-filter-active-active"]');
    userEvent.click(inputElementcheckbox);
    expect(inputElementcheckbox).toBeChecked();

    const Elementcheckbox = document.querySelector('[id="clickable-filter-active-inactive"]');
    userEvent.click(Elementcheckbox);
    expect(Elementcheckbox).toBeChecked();

    userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'ui-users.index.lastName' }),
    );
    expect(screen.getByRole('option', { name: 'ui-users.index.lastName' }).selected).toBeTruthy();
    userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'ui-users.index.username' }),
    );
    expect(screen.getByRole('option', { name: 'ui-users.index.username' }).selected).toBeTruthy();
  });

  it('Should Click export over due loan report button', async () => {
    renderUserSearch();
    const exportoverdueloanreportbutton = document.querySelector('[id="export-overdue-loan-report"]');
    userEvent.click(exportoverdueloanreportbutton);
    await waitFor(() => {
      expect(props.mutator.loans.GET).toBeCalled();
    });
  });

  it('Should Click export claimed returned loan report button', async () => {
    renderUserSearch();
    const exportclaimedreturnedloanreportbutton = document.querySelector('[id="export-claimed-returned-loan-report"]');
    userEvent.click(exportclaimedreturnedloanreportbutton);
    await waitFor(() => {
      expect(props.mutator.loans.GET).toBeCalled();
    });
  });

  it('Should Click cash drawer report button and Clicking onSubmit button for Default format', () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    const cashdrawermodallabel = screen.queryByText('ui-users.reports.cash.drawer.modal.label');
    expect(cashdrawermodallabel).toBeInTheDocument();

    const onSubmit = screen.getByRole('button', { name: 'onSubmit' });
    userEvent.click(onSubmit);
    expect(cashdrawermodallabel).not.toBeInTheDocument();
    expect(props.mutator.cashDrawerReport.POST).toBeCalled();
  });

  it('Should Click cash drawer report button and Clicking onSubmit button for both format', async () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    const cashdrawermodallabel = screen.queryByText('ui-users.reports.cash.drawer.modal.label');
    expect(cashdrawermodallabel).toBeInTheDocument();
    const onSubmitBothFormat = screen.getByRole('button', { name: 'onSubmitBothFormat' });
    userEvent.click(onSubmitBothFormat);
    expect(cashdrawermodallabel).not.toBeInTheDocument();
    expect(props.mutator.cashDrawerReport.POST).toBeCalled();
  });

  it('Should Click cash drawer report button and Clicking onSubmit button for pdf format', () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    const cashdrawermodallabel = screen.queryByText('ui-users.reports.cash.drawer.modal.label');
    expect(cashdrawermodallabel).toBeInTheDocument();
    const onSubmitPdfFormat = screen.getByRole('button', { name: 'onSubmitPdfFormat' });
    userEvent.click(onSubmitPdfFormat);
    expect(cashdrawermodallabel).not.toBeInTheDocument();
    expect(props.mutator.cashDrawerReport.POST).toBeCalled();
  });

  it('Should Click cash drawer report button and Clicking onSubmit button for csv format', () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    const cashdrawermodallabel = screen.queryByText('ui-users.reports.cash.drawer.modal.label');
    expect(cashdrawermodallabel).toBeInTheDocument();
    const onSubmitCsvFormat = screen.getByRole('button', { name: 'onSubmitCsvFormat' });
    userEvent.click(onSubmitCsvFormat);
    expect(cashdrawermodallabel).not.toBeInTheDocument();
    expect(props.mutator.cashDrawerReport.POST).toBeCalled();
  });

  it('Should Click cash drawer report onClose button', () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    const cashdrawermodallabel = screen.queryByText('ui-users.reports.cash.drawer.modal.label');
    expect(cashdrawermodallabel).toBeInTheDocument();
    const cashdrawerreportCloseButton = screen.getByRole('button', { name: 'onClose' });
    userEvent.click(cashdrawerreportCloseButton);
    expect(cashdrawermodallabel).not.toBeInTheDocument();
  });

  it('Should Click financial transaction report button and onSubmit button', () => {
    renderUserSearch();
    const financialtransactionreport = document.querySelector('[id="financial-transaction-report"]');
    userEvent.click(financialtransactionreport);
    const financialtransmodallabel = screen.getByText('ui-users.reports.financial.trans.modal.label');
    expect(financialtransmodallabel).toBeInTheDocument();
    const financialtransonSubmit = screen.getByText('onSubmit');
    userEvent.click(financialtransonSubmit);
    screen.debug(undefined, Infinity);
    expect(financialtransmodallabel).not.toBeInTheDocument();
    expect(props.mutator.financialTransactionsReport.POST).toBeCalled();
  });

  it('Should Click financial transaction report Close button', () => {
    renderUserSearch();
    const financialtransactionreport = document.querySelector('[id="financial-transaction-report"]');
    userEvent.click(financialtransactionreport);
    const financialtransmodallabel = screen.getByText('ui-users.reports.financial.trans.modal.label');
    expect(financialtransmodallabel).toBeInTheDocument();
    const financialtransactionreportCloseButton = screen.getByRole('button', { name: 'onClose' });
    userEvent.click(financialtransactionreportCloseButton);
    expect(financialtransmodallabel).not.toBeInTheDocument();
  });

  it('Should Click export refunds report button, save and close date ', () => {
    renderUserSearch();
    const exportrefundsreportbutton = document.querySelector('[id="export-refunds-report"]');
    userEvent.click(exportrefundsreportbutton);
    expect(screen.getByText('ui-users.reports.refunds.modal.label')).toBeInTheDocument();

    const startDate = document.querySelector('[name="startDate"]');
    userEvent.type(startDate, '2022-01-01');

    const endDate = document.querySelector('[name="endDate"]');
    userEvent.type(endDate, '31/01/2022');

    const saveAndClose = screen.getByText('ui-users.saveAndClose');
    userEvent.click(saveAndClose);

    expect(props.mutator.refundsReport.POST).toBeCalled();
  });

  it('Should Click export refunds report Close button', () => {
    renderUserSearch();
    const exportrefundsreportbutton = document.querySelector('[id="export-refunds-report"]');
    userEvent.click(exportrefundsreportbutton);
    expect(screen.getByText('ui-users.reports.refunds.modal.label')).toBeInTheDocument();

    const refundsreportmodalclosebutton = document.querySelector('[id="refunds-report-modal-close-button"]');
    userEvent.click(refundsreportmodalclosebutton);
    expect(screen.queryByText('ui-users.reports.refunds.modal.label')).not.toBeInTheDocument();
  });

  it('searchResultsCountHeader should render when loaded return true', () => {
    const prop = {
      ...props,
      resources: {
        owners: {
          records: [
            { id: '11', name: 'owner1', personal: { firstName: 'John', lastName: 'Doe', middleName: 'test', preferredFirstName: 'John' } },
          ],
        },
        users: {
          records: []
        },
        records: {
          isPending: false,
          records: [
            { id: '', personal: {} },
          ],
        },
        query:{
          qindex: 'test3'
        },
        patronGroups: {
          records: [{
            filter: jest.fn(),
            group: '',
            id: ''
          }]
        },
      },
      source: {
        totalCount: jest.fn(),
        loaded: jest.fn().mockReturnValue(true),
      },
    };
    renderWithRouter(<UserSearch {...prop} />, translationProperties);
    expect(screen.getByText('stripes-smart-components.searchResultsCountHeader')).toBeInTheDocument();
  });
});
