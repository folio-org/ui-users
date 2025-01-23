import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import ChargeFeeFine from './ChargeFeeFine';
import ChargeForm from './ChargeForm';

const basicProps = {
  resources: {
    activeRecord: {
      isBarcodeValidated: true,
    },
  },
  mutator: {
    activeRecord: {
      update: jest.fn(),
    },
  },
  user: {},
  stripes: {},
  location: {},
  history: {},
  intl: {},
  match: {
    params: {},
  },
  okapi: {
    currentUser: {},
  },
};
const testIds = {
  selectItem: 'selectItem',
};
const itemBarcode = 'itemBarcode';

jest.mock('./ChargeForm', () => jest.fn(({
  onClickSelectItem,
}) => (
  <>
    <button
      type="button"
      data-testid={testIds.selectItem}
      onClick={() => onClickSelectItem(itemBarcode)}
    >
      Enter
    </button>
  </>
)));
jest.mock('./ItemLookup', () => jest.fn(() => <div />));
jest.mock('../Actions/ActionModal', () => jest.fn(() => <div />));

describe('ChargeFeeFine', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    render(<ChargeFeeFine {...basicProps} />);
  });

  it('should trigger ChargeForm', () => {
    expect(ChargeForm).toHaveBeenCalled();
  });

  it('should update activeRecord', async () => {
    const selectItemButton = screen.getByTestId(testIds.selectItem);

    await userEvent.click(selectItemButton);

    expect(basicProps.mutator.activeRecord.update).toHaveBeenCalledWith({
      barcode: itemBarcode,
      isBarcodeValidated: true,
    });
  });
});
