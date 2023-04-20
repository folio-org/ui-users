import React from 'react';
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import {
  TextField,
  TextArea,
} from '@folio/stripes/components';

import '../../../../../../../../test/jest/__mock__';
import ActualCostModal from './ActualCostModal';
import {
  ACTUAL_COST_DEFAULT,
  ACTUAL_COST_MODAL_DEFAULT,
  ACTUAL_COST_TYPES,
} from '../../../../../constants';

TextField.mockImplementation(jest.fn((props) => (
  <div>
    <label htmlFor={props.name}>{props.label}</label>
    <input
      {...props}
    />
  </div>
)));

const initialProps = {
  actualCostModal: {
    isOpen: true,
  },
  setActualCostModal: jest.fn(),
  setActualCostConfirmModal: jest.fn(),
  actualCost: {
    type: ACTUAL_COST_TYPES.BILL,
    actualCostRecord: {
      feeFine: {
        owner: 'owner',
        type: 'type',
      },
      user: {
        firstName: 'firstName',
        lastName: 'lastName',
        middleName: 'middleName',
      },
      item: {},
    },
    additionalInfo: {
      actualCostToBill: '10',
      additionalInformationForStaff: 'additionalInformationForStaff',
      additionalInformationForPatron: 'additionalInformationForPatron',
    },
  },
  setActualCost: jest.fn(),
};
const labelIds = {
  actualCostToBill: 'ui-users.lostItems.modal.actualCostToBill',
  additionalInformationForStaff: 'ui-users.lostItems.modal.additionalInformationForStaff',
  additionalInformationForPatron: 'ui-users.lostItems.modal.additionalInformationForPatron',
  billTitle: 'ui-users.lostItems.modal.bill.title',
  doNotBillTitle: 'ui-users.lostItems.modal.doNotBill.title',
  continueButton: 'ui-users.lostItems.modal.button.continue',
  cancelButton: 'ui-users.lostItems.modal.button.cancel',
};
const testIds = {
  actualCost: 'actualCost',
  continueActualCost: 'continueActualCost',
  cancelActualCost: 'cancelActualCost',
};

describe('ActualCostModal', () => {
  describe('when actual cost type equals "bill"', () => {
    beforeEach(() => {
      render(
        <ActualCostModal
          {...initialProps}
        />
      );
    });

    it('should render modal window', () => {
      expect(screen.getByTestId(testIds.actualCost)).toBeVisible();
    });

    it('should have correct title', () => {
      expect(screen.getByText(labelIds.billTitle)).toBeVisible();
    });

    it('should render fee fine owner name', () => {
      expect(screen.getByText(initialProps.actualCost.actualCostRecord.feeFine.owner)).toBeVisible();
    });

    it('should render fee fine owner type', () => {
      expect(screen.getByText(initialProps.actualCost.actualCostRecord.feeFine.type)).toBeVisible();
    });

    it('should render "actualCostToBill" field', () => {
      expect(screen.getByText(labelIds.actualCostToBill)).toBeVisible();
    });

    it('should render "actualCostToBill" field with correct props', () => {
      const expectedProps = {
        required: true,
        value: initialProps.actualCost.additionalInfo.actualCostToBill,
      };

      expect(TextField).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render "additionalInformationForStaff" textarea', () => {
      expect(screen.getByText(labelIds.additionalInformationForStaff)).toBeVisible();
    });

    it('should render "additionalInformationForStaff" textarea with correct props', () => {
      const expectedProps = {
        value: initialProps.actualCost.additionalInfo.additionalInformationForStaff,
      };

      expect(TextArea).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render "additionalInformationForPatron" textarea', () => {
      expect(screen.getByText(labelIds.additionalInformationForPatron)).toBeVisible();
    });

    it('should render "additionalInformationForPatron" textarea with correct props', () => {
      const expectedProps = {
        value: initialProps.actualCost.additionalInfo.additionalInformationForPatron,
      };

      expect(TextArea).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    describe('footer', () => {
      it('should render "Continue" button label', () => {
        expect(screen.getByText(labelIds.continueButton)).toBeVisible();
      });

      it('should trigger "setActualCostModal" and "setActualCostConfirmModal" with correct data', () => {
        const continueButton = screen.getByTestId(testIds.continueActualCost);

        fireEvent.click(continueButton);

        expect(initialProps.setActualCostModal).toHaveBeenCalledWith(ACTUAL_COST_MODAL_DEFAULT);
        expect(initialProps.setActualCostConfirmModal).toHaveBeenCalledWith({
          isOpen: true,
        });
      });

      it('should render "Cancel" button label', () => {
        expect(screen.getByText(labelIds.cancelButton)).toBeVisible();
      });

      it('should trigger "setActualCostModal" and "setActualCost" with correct data', () => {
        const cancelButton = screen.getByTestId(testIds.cancelActualCost);

        fireEvent.click(cancelButton);

        expect(initialProps.setActualCostModal).toHaveBeenCalledWith(ACTUAL_COST_MODAL_DEFAULT);
        expect(initialProps.setActualCost).toHaveBeenCalledWith(ACTUAL_COST_DEFAULT);
      });
    });
  });

  describe('when actual cost type equals "doNotBill"', () => {
    const props = {
      ...initialProps,
      actualCost: {
        ...initialProps.actualCost,
        type: ACTUAL_COST_TYPES.DO_NOT_BILL,
      },
    };

    beforeEach(() => {
      render(
        <ActualCostModal
          {...props}
        />
      );
    });

    it('should have correct title', () => {
      expect(screen.getByText(labelIds.doNotBillTitle)).toBeVisible();
    });

    it('should render "do not bill" value', () => {
      const doNotBillValue = '0.00';

      expect(screen.getByText(doNotBillValue)).toBeVisible();
    });

    it('should not render additional patron information', () => {
      expect(screen.queryByText(labelIds.additionalInformationForPatron)).not.toBeInTheDocument();
    });
  });
});
