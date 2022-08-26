import userEvent from '@testing-library/user-event';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import okapiCurrentUser from 'fixtures/okapiCurrentUser';
import renderWithRouter from 'helpers/renderWithRouter';
import ChargeForm from './ChargeForm';

jest.unmock('@folio/stripes/util');
jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const renderChargeForm = (props) => renderWithRouter(<ChargeForm {...props} />);

const getStateMock = jest.fn();
const onChangeOwnerMock = jest.fn();
const changeMock = jest.fn();
const resetMock = jest.fn();
const onChangeFeeFineMock = jest.fn();

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
    'ownerId' : '109155d9-3b60-4a3d-a6b1-066cf1b1356b',
    'metadata' : {
      'createdDate' : '2022-01-11T13:17:33.422+00:00',
      'createdByUserId' : '279cec9f-1ae5-50b2-bd65-cfd0803fc9a9',
      'updatedDate' : '2022-01-11T13:17:33.422+00:00',
      'updatedByUserId' : '279cec9f-1ae5-50b2-bd65-cfd0803fc9a9'
    },
    'id' : 'ec1b5df0-9eab-490b-86ef-ebaa3bbd0193'
  }
];

const propData = {
  user: okapiCurrentUser,
  item: {
    barcode: '12345',
    callNumberComponents: {
      prefix: 'prefix',
      callNumber: 'callNumber',
      suffix: 'suffix',
    },
    enumeration: 'enumeration',
    chronology: 'chronology',
    volume: 'volume',
  },

  intl: {
    formatMessage: jest.fn(),
  },
  stripes: {
    history: {
      push: getStateMock,
    }
  },
  ownerId: '109155d9-3b60-4a3d-a6b1-066cf1b1356b',
  owners: [
    {
      id: '109155d9-3b60-4a3d-a6b1-066cf1b1356b',
      owner: 'test',
      metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' },
      servicePointOwner: [],
      defaultChargeNoticeId: '109155e9-3b60-4a3d-a6b1-066cf1b1356b'
    },
  ],
  ownerList: [
    {
      id: '109155d9-3b60-4a3d-a6b1-066cf1b1356b',
      owner: 'test',
      metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' },
      servicePointOwner: []
    },
  ],
  feefines,
  form: {
    change: changeMock,
    reset: resetMock,
    getState: getStateMock,
  },
  onClickCancel: jest.fn(),
  onChangeOwner: onChangeOwnerMock,
  onChangeFeeFine: onChangeFeeFineMock,
  handleSubmit: jest.fn(),
  onClickSelectItem: jest.fn(),
  onFindShared: jest.fn(),
  onClose: jest.fn(),
  pristine: false,
  submitting: false,
  invalid: false,
  selectedLoan: {},
  isPending: {
    owners: false,
    feefines: false
  },
  onSubmit: jest.fn(),
  servicePointsIds: [],
  defaultServicePointId: 'c4c90014-c8c9-4ade-8f24-b5e313319f4b',
  location: {
    pathname: '/users/c626fba5-7749-4e67-830f-d82f50ee6c51/charge',
  },
  history: {
    push: getStateMock,
  },
  initialValues: {
    amount: '',
    feeFineId: '',
    notify: true,
    ownerId: '109155d9-3b60-4a3d-a6b1-066cf1b1356b',
  },
  match: {
    params : { id: 'ab579dc3-219b-4f5b-8068-ab1c7a55c402' }
  },
  feeFineTypeOptions: [{
    automatic: false,
    feeFineType: 'Lost item processing fee',
    id: 'c7dede15-aa48-45ed-860b-f996540180e0',
    ownerId: '109155d9-3b60-4a3d-a6b1-066cf1b1356b',
    metadata: { createdDate: '2022-03-01T03:22:48.262+00:00', updatedDate: '2022-03-01T03:22:48.262+00:00' },
  }],
};

describe('ChargeForm component', () => {
  it('If ChargeForm Renders', () => {
    renderChargeForm(propData);
    expect(screen.getByText('ui-users.charge.Pay')).toBeInTheDocument();
    expect(screen.getByText('ui-users.charge.onlyCharge')).toBeInTheDocument();
  });

  it('Onchange owner', async () => {
    renderChargeForm(propData);
    userEvent.selectOptions(document.querySelector('[name="ownerId"]'), screen.getByText('test'));
    expect(onChangeOwnerMock).toHaveBeenCalled();
  });

  it('If there is a defaultChargeNoticeId', () => {
    /* The notify patron block must be enable */
    renderChargeForm(propData);
    userEvent.click(document.querySelector('[name="notify"]'));
    expect(screen.getByText('ui-users.accounts.notifyPatron')).toBeInTheDocument();
  });

  it('Checking the flow', async () => {
    renderChargeForm(propData);
    userEvent.selectOptions(document.querySelector('[name="ownerId"]'), screen.getByText('test'));

    await waitFor(() => {
      expect(screen.getByText('Lost item processing fee')).toBeInTheDocument();
      expect(document.querySelector('[id="feeFineType"]')).toBeInTheDocument();
    });

    userEvent.click(document.querySelector('[id="feeFineType"] option:not([disabled])'));
    fireEvent.change(document.querySelector('[id="amount"]'), { target: { value: 2 } });
    userEvent.click(document.querySelector('[name="notify"]'));

    await waitFor(() => {
      expect(document.querySelector('[id="comments"]')).toBeInTheDocument();
    });

    userEvent.type(document.querySelector('[id="comments"]'), 'Test Comment');
    userEvent.click(document.querySelector('[id="chargeAndPay"]'));
    userEvent.click(document.querySelector('[id="chargeOnly"]'));
    expect(onChangeOwnerMock).toHaveBeenCalled();
    expect(screen.getByText('ui-users.charge.item.status')).toBeInTheDocument();
    expect(screen.getByText('ui-users.accounts.notifyPatron')).toBeInTheDocument();
    expect(screen.getByText('ui-users.charge.item.callNumber')).toBeInTheDocument();
  });
});
