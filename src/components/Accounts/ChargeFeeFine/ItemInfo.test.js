import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import ItemInfo from './ItemInfo';
import { NEW_FEE_FINE_FIELD_NAMES } from '../../../constants';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderItemInfo = (props) => render(
  <ItemInfo {...props} />
);

const basicProps = {
  onClickSelectItem: jest.fn(),
  item: {},
  editable: true,
  resources: {
    items: {
      records: [],
    },
    activeRecord: {
      barcode: 'itemBarcode',
    },
  },
  mutator: {
    activeRecord: {
      replace: jest.fn(),
    },
  },
  form: {
    change: jest.fn(),
  },
  values: {},
};
const labelIds = {
  itemTitle: 'ui-users.charge.item.title',
  chargeButton: 'ui-users.charge.item.button',
};
const testIds = {
  itemBarcodeField: 'itemBarcodeField',
};

jest.mock('react-final-form', () => ({
  Field: jest.fn(({
    children,
    'data-testid': testId,
    validate,
  }) => {
    return children({
      meta: {},
      input: {
        validate,
        'data-testid': testId,
        value: '',
      },
    });
  }),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: jest.fn(() => <div />),
}));

describe('ItemInfo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    beforeEach(() => {
      renderItemInfo(basicProps);
    });

    it('should render item title', () => {
      const itemTitle = screen.getByText(labelIds.itemTitle);

      expect(itemTitle).toBeInTheDocument();
    });

    it('should get item information', async () => {
      const chargeButton = screen.getByText(labelIds.chargeButton);

      await userEvent.click(chargeButton);

      expect(basicProps.onClickSelectItem).toHaveBeenCalled();
    });
  });

  describe('Component updating', () => {
    const itemBarcode = 'newItemBarcode';
    const newProps = {
      ...basicProps,
      resources: {
        ...basicProps.resources,
        items: {
          records: [
            {
              id: 'itemId',
            }
          ]
        }
      },
    };

    beforeEach(async () => {
      const { rerender } = renderItemInfo(basicProps);

      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

      await userEvent.type(itemBarcodeField, itemBarcode);

      rerender(<ItemInfo {...newProps} />);
    });

    it('should change "key" value of barcode field', () => {
      expect(basicProps.form.change).toHaveBeenCalledWith(NEW_FEE_FINE_FIELD_NAMES.KEY_OF_ITEM_BARCODE, basicProps.values[NEW_FEE_FINE_FIELD_NAMES.KEY_OF_ITEM_BARCODE] ? 0 : 1);
    });
  });

  describe('Item barcode changing', () => {
    const itemBarcode = 'newItemBarcode';

    beforeEach(async () => {
      renderItemInfo(basicProps);

      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

      await userEvent.type(itemBarcodeField, itemBarcode);
    });

    it('should replace activeRecord', () => {
      expect(basicProps.mutator.activeRecord.replace).toHaveBeenCalledWith({
        ...basicProps.resources.activeRecord,
        isBarcodeValidated: false,
        barcode: '',
      });
    });

    it('should change item barcode field', () => {
      expect(basicProps.form.change).toHaveBeenCalledWith(NEW_FEE_FINE_FIELD_NAMES.ITEM_BARCODE, itemBarcode);
    });
  });
});
