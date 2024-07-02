import React from 'react';
import { createMemoryHistory } from 'history';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import okapiCurrentUser from 'fixtures/okapiCurrentUser';

import '../../../../test/jest/__mock__';

import renderWithRouter from 'helpers/renderWithRouter';
import ChargeFeeFine from './ChargeFeeFine';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/util');

jest.mock('../Actions/ActionModal', () => {
  return jest.fn(() => <div data-testid="action-modal">ActionModal</div>);
});

const history = createMemoryHistory();

const getStateMock = jest.fn();

const defaultProps = {
  resources: {
    allfeefines: {
      records: [
        { id: '1', feeFineType:'test 1' },
        { id: '2', feeFineType:'test 2' },
      ],
    },
    feefines: {
      records: [
        { id: 1, name: 'Fee/Fine 1' },
        { id: 2, name: 'Fee/Fine 2' },
      ],
    },
    owners: {
      records: [
        { id: '1', owner: 'Library' },
        { id: '2', owner: 'Patron' },
      ],
    },
    activeRecord: {
      barcode: '12345',
    },
    items: {
      records: [{ id: '1', setState: { lookup: true }, title: 'Item 1', barcode: '12345', location: { name: 'Location 1' } }],
    },
  },
  mutator: {
    accounts: {
      POST: jest.fn(),
      PUT: jest.fn(),
    },
    feefineactions: {
      POST: jest.fn(),
    },
    activeRecord: {
      update: jest.fn(),
    },
    account: {
      GET: jest.fn(),
    },
    pay: {
      POST: jest.fn(),
    },
  },
  stripes: {
    history: {
      push: getStateMock,
    },
  },
  okapi: {
    url: 'https://localhost:9130',
    tenant: 'diku',
    okapiReady: true,
    authFailure: [],
    bindings: {},
    currentUser: okapiCurrentUser,
  },
  selectedLoan: {},
  user: {
    id: '1',
    firstName: 'small',
    lastName: 'big',
  },
  intl: {
    formatMessage: jest.fn(),
  },
  location: history.location,
  history: {
    push: getStateMock,
  },
  match: {
    params : { loanid: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402' },
  },
  onChangeFeeFine: jest.fn(),
};

const renderChargeFeeFine = (props) => renderWithRouter(<ChargeFeeFine {...props} {...defaultProps} />);

describe('ChargeFeeFine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('click item button when labelElement value is changed', () => {
    renderChargeFeeFine();
    const labelElement = screen.getAllByRole('textbox');
    const labelElement2 = labelElement.find((el) => el.getAttribute('placeholder') === 'ui-users.charge.item.placeholder');
    userEvent.type(labelElement2, 'test');
    expect(labelElement2).toHaveValue('test');
    const itemButton = screen.getByRole('button', { name: 'ui-users.charge.item.button' });
    expect(itemButton).toBeInTheDocument();
    userEvent.click(itemButton);
  });

  it('click item button and clear the field', () => {
    renderChargeFeeFine();
    const labelElement = screen.getAllByRole('textbox');
    const labelElement2 = labelElement.find((el) => el.getAttribute('placeholder') === 'ui-users.charge.item.placeholder');
    userEvent.type(labelElement2, 'test');
    expect(labelElement2).toHaveValue('test');
    const clearButton = screen.getByLabelText('stripes-components.clearThisField');
    expect(clearButton).toBeInTheDocument();
    userEvent.click(clearButton);
    expect(clearButton).not.toBeInTheDocument();
  });
  it('updates owner id when owner is changed', () => {
    renderChargeFeeFine();
    const ownerSelect = screen.getByRole('combobox', { name: 'ui-users.charge.owner.label' });
    userEvent.selectOptions(ownerSelect, '2');
    expect(screen.getByRole('option', { name: 'Patron' }).selected).toBe(true);
  });
  it('AmountInput', () => {
    renderChargeFeeFine();
    const input = screen.getByRole('spinbutton', { name: 'ui-users.charge.amount.label' });
    expect(input).toHaveValue(null);
    userEvent.type(input, '1234.56');
    userEvent.tab();
    expect(input).toHaveValue(1234.56);
  });
  it('click charge button', () => {
    renderChargeFeeFine();
    const chargeButton = screen.getAllByRole('button');
    const chargeButton2 = chargeButton.find((el) => el.getAttribute('id') === 'chargeOnly');
    userEvent.click(chargeButton2);
  });
  it('click pay button', () => {
    renderChargeFeeFine();
    const payButton = screen.getByRole('button', { name: 'ui-users.charge.Pay' });
    expect(payButton).toBeInTheDocument();
    userEvent.click(payButton);
  });
  // it('render new props', () => {
  //   const propData = {
  //     resources: {
  //       feefines: {
  //         records: [{}],
  //       },
  //       owners: {
  //         records: [{}],
  //       },
  //       activeRecord: {},
  //       items: {
  //         records: [{ id: '2', lookup: false, title: 'Item 2', barcode: '67890', location: { name: 'Location 2' } }],
  //       },
  //     },
  //     mutator: {
  //       accounts: {
  //         POST: jest.fn(),
  //         PUT: jest.fn(),
  //       },
  //       feefineactions: {
  //         POST: jest.fn(),
  //       },
  //       activeRecord: {
  //         update: jest.fn(),
  //       },
  //       account: {
  //         GET: jest.fn(),
  //       },
  //       pay: {
  //         POST: jest.fn(),
  //       },
  //     },
  //     stripes: {
  //       history: {
  //         push: getStateMock,
  //       }
  //     },
  //     match: {
  //       params : { loanid: 'loanid' },
  //     },
  //     okapi: {
  //       url: 'https://localhost:9130',
  //       tenant: 'diku',
  //       okapiReady: true,
  //       authFailure: [],
  //       bindings: {},
  //       currentUser: okapiCurrentUser,
  //     },
  //     selectedLoan: {},
  //   };
  //   const renderUpdatedChargeFeeFine = (props) => renderWithRouter(<ChargeFeeFine {...props} {...propData} />);
  //   renderUpdatedChargeFeeFine(propData);
  // });
});
