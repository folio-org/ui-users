import React from 'react';
import {
  render,
  screen,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../../../../../../test/jest/__mock__';
import ActualCostConfirmModal from './ActualCostConfirmModal';
import {
  ACTUAL_COST_CONFIRM_MODAL_DEFAULT,
  ACTUAL_COST_DEFAULT,
  ACTUAL_COST_TYPES,
} from '../../../../../constants';

const initialProps = {
  actualCostConfirmModal: {
    isOpen: true,
  },
  setActualCost: jest.fn(),
  setActualCostModal: jest.fn(),
  setActualCostConfirmModal: jest.fn(),
  actualCost: {
    type: ACTUAL_COST_TYPES.BILL,
    actualCostRecord: {
      id: 'id',
      feeFine: {},
      user: {},
    },
    additionalInfo: {
      actualCostToBill: 'actualCostToBill',
      additionalInformationForStaff: 'additionalInformationForStaff',
      additionalInformationForPatron: 'additionalInformationForPatron',
    },
  },
  billRecord: jest.fn(),
};
const labelIds = {
  billConfirmText: 'ui-users.lostItems.modal.bill.confirm.text',
  doNotBillConfirmText: 'ui-users.lostItems.modal.doNotBill.confirm.text',
  additionalInformationForStaff: 'ui-users.lostItems.modal.additionalInformationForStaff',
  additionalInformationForPatron: 'ui-users.lostItems.modal.additionalInformationForPatron',
  confirmBillTitle: 'ui-users.lostItems.modal.bill.confirm.title',
  confirmDoNotBillTitle: 'ui-users.lostItems.modal.doNotBill.confirm.title',
  confirmButton: 'ui-users.lostItems.modal.button.confirm',
  keepEditing: 'ui-users.lostItems.modal.button.keepEditing',
};
const testIds = {
  actualCost: 'actualCost',
  confirmActualCost: 'confirmActualCost',
  keepEditingActualCost: 'keepEditingActualCost',
};

describe('ActualCostConfirmModal', () => {
  describe('when actual cost type equals "bill"', () => {
    beforeEach(() => {
      render(
        <ActualCostConfirmModal
          {...initialProps}
        />
      );
    });

    it('should render modal window', () => {
      expect(screen.getByTestId(testIds.actualCost)).toBeVisible();
    });

    it('should have correct title', () => {
      expect(screen.getByText(labelIds.confirmBillTitle)).toBeVisible();
    });

    it('should render confirm bill message', () => {
      expect(screen.getByText(labelIds.billConfirmText)).toBeVisible();
    });

    it('should render "additionalInformationForStaff" message', () => {
      expect(screen.getByText(labelIds.additionalInformationForStaff)).toBeVisible();
    });

    it('should render "additionalInformationForPatron" message', () => {
      expect(screen.getByText(labelIds.additionalInformationForPatron)).toBeVisible();
    });

    describe('footer', () => {
      it('should render "Confirm" button label', () => {
        expect(screen.getByText(labelIds.confirmButton)).toBeVisible();
      });

      it('should trigger "setActualCostConfirmModal", "billRecord" and "setActualCost" with correct data', () => {
        const confirmButton = screen.getByTestId(testIds.confirmActualCost);
        const billRecordPayload = initialProps.actualCost;

        fireEvent.click(confirmButton);

        expect(initialProps.setActualCostConfirmModal).toHaveBeenCalledWith(ACTUAL_COST_CONFIRM_MODAL_DEFAULT);
        expect(initialProps.setActualCost).toHaveBeenCalledWith(ACTUAL_COST_DEFAULT);
        expect(initialProps.billRecord).toHaveBeenCalledWith(billRecordPayload);
      });

      it('should render "keepEditing" button label', () => {
        expect(screen.getByText(labelIds.keepEditing)).toBeVisible();
      });

      it('should trigger "setActualCostConfirmModal" and "setActualCostModal" with correct data', () => {
        const keepEditingButton = screen.getByTestId(testIds.keepEditingActualCost);

        fireEvent.click(keepEditingButton);

        expect(initialProps.setActualCostConfirmModal).toHaveBeenCalledWith(ACTUAL_COST_CONFIRM_MODAL_DEFAULT);
        expect(initialProps.setActualCostModal).toHaveBeenCalledWith({
          isOpen: true,
        });
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
        <ActualCostConfirmModal
          {...props}
        />
      );
    });

    it('should have correct title', () => {
      expect(screen.getByText(labelIds.confirmDoNotBillTitle)).toBeVisible();
    });

    it('should render confirm do not bill message', () => {
      expect(screen.getByText(labelIds.doNotBillConfirmText)).toBeVisible();
    });

    it('should not render additional patron information', () => {
      expect(screen.queryByText(labelIds.additionalInformationForPatron)).not.toBeInTheDocument();
    });
  });
});
