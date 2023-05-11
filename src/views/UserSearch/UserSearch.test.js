import React from 'react';
import userEvent from '@testing-library/user-event';
import {
  screen,
} from '@testing-library/react';
import {
  IfInterface,
  IfPermission,
} from '@folio/stripes/core';
import '__mock__';
import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import renderWithRouter from 'helpers/renderWithRouter';
import '__mock__/matchMedia.mock';
import { createMemoryHistory } from 'history';
import translationProperties from 'helpers/translationProperties';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';
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
  format: 'csv'
};

jest.mock('../../components/ReportModals/CashDrawerReportModal', () => (prop) => <div><button type="button" onClick={() => prop.onClose()}>onClose</button><button type="button" onClick={() => prop.onSubmit(dataDefault)}>onSubmit</button><button type="button" onClick={() => prop.onSubmit(data2)}>onSubmitBothFormat</button><button type="button" onClick={() => prop.onSubmit(data3)}>onSubmitPdfFormat</button><button type="button" onClick={() => prop.onSubmit(data4)}>onSubmitCsvFormat</button></div>);
jest.mock('../../components/LostItemsLink', () => jest.fn().mockReturnValue('LostItemsLink'));
jest.mock('../../components/CustomFieldsFilters/CustomFieldsFilters', () => jest.fn().mockReturnValue('CustomFieldsFilters'));
jest.mock('../../components/ReportModals/FinancialTransactionsReportModal', () => (prop) => <div><button type="button" onClick={() => prop.onClose()}>onClose</button><button type="button" onClick={() => prop.onSubmit(data)}>onSubmit</button></div>);

const history = createMemoryHistory();
const props = {
  contentRef: {},
  history: { push: jest.fn() },
  idPrefix: 'users-',
  initialSearch: 'test3',
  intl: { formatMessage: jest.fn() },
  location: history.location,
  match: { params: { id: '/users/preview/:id' }, urlParams: { params: { id: '/users/preview/:id' } } },
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
      records: [
        { id: '11', name: 'owner1', personal: { firstName: 'John', lastName: 'Doe', middleName: 'test', preferredFirstName: 'John' } },
        { id: '12', name: 'owner2', personal: { firstName: 'Jane', lastName: 'Do', middleName: 'test2', preferredFirstName: 'Jane' } },
        { id: '13', name: 'owner3', personal: { firstName: 'Bob', lastName: 'Smith', middleName: 'test3', preferredFirstName: 'Bob' } },
      ],
      id: '109155d9-3b60-4a3d-a6b1-066cf1b1356b',
      owner: 'test',
      metadata: {
        createdDate: '2022-03-01T03:22:48.262+00:00',
        updatedDate: '2022-03-01T03:22:48.262+00:00'
      },
      servicePointOwner: [],
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
    loans: {},
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
      POST: jest.fn().mockReturnValue({ reportData: { id: 'report2' } })
    }
  },
  okapi: {
    currentUser: okapiCurrentUser,
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

  it('Check if Search are shown and hide', () => {
    renderUserSearch();
    expect(screen.getByText('ui-users.userSearch')).toBeInTheDocument();
    expect(screen.getByText('stripes-smart-components.hideSearchPane')).toBeInTheDocument();
    expect(screen.getByText('stripes-components.searchFieldIndex')).toBeInTheDocument();

    const hideSearchPane = screen.getByRole('button', { name: 'stripes-smart-components.hideSearchPane' });
    userEvent.click(hideSearchPane);

    expect(screen.getByText('stripes-smart-components.showSearchPane')).toBeInTheDocument();

    const showSearchPane = screen.getByRole('button', { name: 'stripes-smart-components.showSearchPane' });
    userEvent.click(showSearchPane);
  });
  it('UserDetail pane should be present', () => {
    renderUserSearch();
    const Iconbutton = screen.getAllByRole('button', { name: 'Icon' });
    userEvent.click(Iconbutton[0]);

    userEvent.click(document.querySelector('[id="input-user-search-qindex"]'), screen.getByText('ui-users.index.all'));
    userEvent.selectOptions(document.querySelector('[id="input-user-search-qindex"]'), screen.getByText('ui-users.index.all'));
    expect(screen.getByText('ui-users.index.all')).toBeTruthy();
    expect((screen.getByRole('option', { name: 'ui-users.index.all' })).selected).toBeTruthy();
    userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'ui-users.index.barcode' }),
    );
    expect(screen.getByRole('option', { name: 'ui-users.index.barcode' }).selected).toBeTruthy();
  });

  it('Should submit search input value', () => {
    renderUserSearch();
    const inputText = screen.getByRole('textbox');
    expect(inputText).toHaveValue('');
    userEvent.click(inputText);
    userEvent.type(inputText, 'Enter text testing');
    expect(inputText).toHaveValue('Enter text testing');
    const userSearch = document.querySelector('[id="input-user-search"]');
    userEvent.type(userSearch, 'record1');
    expect(userSearch).toHaveValue('record1');
    const SearchButtonsubmit = document.querySelector('[id="submit-user-search"]');
    userEvent.click(SearchButtonsubmit);
    const linktext1 = screen.getByText('Doe, John_Doe (John)');
    userEvent.click(linktext1);
    expect(linktext1).toHaveAttribute('href', 'undefined/preview/4');
  });

  it('accordion toggle button users filter accordion tags', () => {
    renderUserSearch();
    const accordiontags = document.querySelector('[id="accordion-toggle-button-users-filter-accordion-tags"]');
    userEvent.click(accordiontags);
  });

  it('filter multi value status', () => {
    renderUserSearch();
    const filterAccordionTags = document.querySelector('[class="multiSelectFilterField"]');
    expect(filterAccordionTags).toHaveValue('');
    userEvent.type(filterAccordionTags, 'record1');
    expect(filterAccordionTags).toHaveValue('record1');
  });

  it('clickableResetAll', () => {
    renderUserSearch();
    const clickableResetAll = document.querySelector('[id="clickable-reset-all"]');
    userEvent.click(clickableResetAll);
  });

  it('clickable filter active, inactive and selecting options', () => {
    renderUserSearch();
    const inputElementcheckbox = document.querySelector('[id="clickable-filter-active-active"]');
    userEvent.click(inputElementcheckbox);
    expect(inputElementcheckbox).toBeChecked();

    const Elementcheckbox = document.querySelector('[id="clickable-filter-active-inactive"]');
    userEvent.click(Elementcheckbox);
    expect(Elementcheckbox).toBeChecked();
    const patronGroupbutton = document.querySelector('[id="accordion-toggle-button-users-filter-accordion-patron-group"]');
    userEvent.click(patronGroupbutton);

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
    const showColumns = screen.getAllByText('stripes-smart-components.columnManager.showColumns');
    userEvent.click(showColumns[0]);

    const columnCheckboxXctive = document.querySelector('[id="column-manager-users-visible-columns-column-checkbox-active"]');
    userEvent.click(columnCheckboxXctive);
  });

  it('Clicking addNewbutton button', () => {
    renderUserSearch();
    const addNewbutton = document.querySelector('[id="clickable-newuser"]');
    userEvent.click(addNewbutton);
  });

  it('Should Click export over due loan report button', () => {
    renderUserSearch();
    const exportoverdueloanreportbutton = document.querySelector('[id="export-overdue-loan-report"]');
    userEvent.click(exportoverdueloanreportbutton);
  });

  it('Should Click export claimed returned loan report button', () => {
    renderUserSearch();
    const exportclaimedreturnedloanreportbutton = document.querySelector('[id="export-claimed-returned-loan-report"]');
    userEvent.click(exportclaimedreturnedloanreportbutton);
  });

  it('Should Click cash drawer report button and Clicking onSubmit button for Default format', () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    const onSubmit = screen.getByRole('button', { name: 'onSubmit' });
    userEvent.click(onSubmit);
  });

  it('Should Click cash drawer report button and Clicking onSubmit button for both format', () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    const onSubmitBothFormat = screen.getByRole('button', { name: 'onSubmitBothFormat' });
    userEvent.click(onSubmitBothFormat);
  });

  it('Should Click cash drawer report button and Clicking onSubmit button for pdf format', () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    const onSubmitPdfFormat = screen.getByRole('button', { name: 'onSubmitPdfFormat' });
    userEvent.click(onSubmitPdfFormat);
  });

  it('Should Click cash drawer report button and Clicking onSubmit button for csv format', () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    const onSubmitCsvFormat = screen.getByRole('button', { name: 'onSubmitCsvFormat' });
    userEvent.click(onSubmitCsvFormat);
  });

  it('Should Click cash drawer report onClose button', () => {
    renderUserSearch();
    const cashdrawerreportbutton = document.querySelector('[id="cash-drawer-report"]');
    userEvent.click(cashdrawerreportbutton);
    userEvent.click(screen.getByRole('button', { name: 'onClose' }));
  });

  it('Should Click financial transaction report button and onSubmit button', () => {
    renderUserSearch();
    const financialtransactionreport = document.querySelector('[id="financial-transaction-report"]');
    userEvent.click(financialtransactionreport);
    userEvent.click(screen.getByRole('button', { name: 'onSubmit' }));
  });

  it('Should Click financial transaction report Close button', () => {
    renderUserSearch();
    const financialtransactionreport = document.querySelector('[id="financial-transaction-report"]');
    userEvent.click(financialtransactionreport);
    userEvent.click(screen.getByRole('button', { name: 'onClose' }));
  });

  it('Should Click export refunds report button, save and close date ', () => {
    renderUserSearch();
    const exportrefundsreportbutton = document.querySelector('[id="export-refunds-report"]');
    userEvent.click(exportrefundsreportbutton);
    expect(screen.getByText('ui-users.reports.refunds.modal.label')).toBeInTheDocument();

    const startDate = document.querySelector('[name="startDate"]');
    userEvent.type(startDate, '01/01/2022');

    const startdateclearFieldValue = document.querySelector('[aria-label="stripes-components.clearFieldValue"]');
    userEvent.click(startdateclearFieldValue);

    const endDate = document.querySelector('[name="endDate"]');
    userEvent.type(endDate, '31/01/2022');

    const multiSelectValueInput = document.querySelector('[class="multiSelectValueInput"]');
    userEvent.type(multiSelectValueInput, 'testing22');

    const openmenu = document.querySelector('[aria-label="open menu"]');
    userEvent.click(openmenu);

    const saveAndClose = screen.getByText('ui-users.saveAndClose');
    userEvent.click(saveAndClose);
  });

  it('Should Click export refunds report Close button', () => {
    renderUserSearch();
    const exportrefundsreportbutton = document.querySelector('[id="export-refunds-report"]');
    userEvent.click(exportrefundsreportbutton);
    expect(screen.getByText('ui-users.reports.refunds.modal.label')).toBeInTheDocument();

    const multiSelectValueInput = document.querySelector('[class="multiSelectValueInput"]');
    userEvent.type(multiSelectValueInput, 'testing22');

    const refundsreportmodalclosebutton = document.querySelector('[id="refunds-report-modal-close-button"]');
    userEvent.click(refundsreportmodalclosebutton);
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
