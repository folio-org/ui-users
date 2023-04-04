import React from 'react';
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';

import '../../../../../../../../test/jest/__mock__';
import {
  ACTUAL_COST_DEFAULT,
  ACTUAL_COST_DETAILS_MODAL_DEFAULT,
} from '../../../../../constants';
import ActualCostDetailsModal from './ActualCostDetailsModal';

const initialProps = {
  actualCostDetailsModal: {
    isOpen: true,
  },
  setActualCost: jest.fn(),
  setActualCostDetailsModal: jest.fn(),
  actualCost: {
    actualCostRecord: {
      id: 'id',
      feeFine: {},
      user: {},
      status: 'Cancelled'
    },
    additionalInfo: {
      actualCostToBill: 'actualCostToBill',
      additionalInformationForStaff: 'additionalInformationForStaff',
      additionalInformationForPatron: 'additionalInformationForPatron',
    },
  },
};
const labelIds = {
  actualCostDetails: 'ui-users.lostItems.list.columnName.action.actualCostDetails',
  summaryMessageCharged: 'ui-users.lostItems.modal.summaryMessageCharged',
  summaryMessageNotCharged: 'ui-users.lostItems.modal.summaryMessageNotCharged',
  additionalInformationForStaff: 'ui-users.lostItems.modal.additionalInformationForStaff',
  additionalInformationForPatron: 'ui-users.lostItems.modal.additionalInformationForPatron',
  close: 'ui-users.lostItems.modal.button.close',
};
const testIds = {
  actualCostDetails: 'actualCostDetails',
  closeActualCostDetails: 'closeActualCostDetails',
};

describe('ActualCostDetailsModal', () => {
  describe('when the record has "Cancelled" status', () => {
    beforeEach(() => {
      render(
        <ActualCostDetailsModal
          {...initialProps}
        />
      );
    });

    it('should render modal window', () => {
      expect(screen.getByTestId(testIds.actualCostDetails)).toBeVisible();
    });

    it('should have correct title', () => {
      expect(screen.getByText(labelIds.actualCostDetails)).toBeVisible();
    });

    it('should render summary message', () => {
      expect(screen.getByText(labelIds.summaryMessageNotCharged)).toBeVisible();
    });

    it('should render "additionalInformationForStaff" message', () => {
      expect(screen.getByText(labelIds.additionalInformationForStaff)).toBeVisible();
    });

    it('should render "additionalInformationForPatron" message', () => {
      expect(screen.getByText(labelIds.additionalInformationForPatron)).toBeVisible();
    });

    describe('footer', () => {
      it('should render "OK" button label', () => {
        expect(screen.getByText(labelIds.close)).toBeVisible();
      });

      it('should trigger onClose when "OK" button is clicked', () => {
        const okButton = screen.getByTestId(testIds.closeActualCostDetails);

        fireEvent.click(okButton);

        expect(initialProps.setActualCostDetailsModal).toHaveBeenCalledWith(ACTUAL_COST_DETAILS_MODAL_DEFAULT);
        expect(initialProps.setActualCost).toHaveBeenCalledWith(ACTUAL_COST_DEFAULT);
      });
    });
  });

  describe('when the record has "Billed" status', () => {
    const props = {
      ...initialProps,
      actualCost: {
        ...initialProps.actualCost,
        actualCostRecord: {
          ...initialProps.actualCost.actualCostRecord,
          status: 'Billed',
        }
      },
    };

    beforeEach(() => {
      render(
        <ActualCostDetailsModal
          {...props}
        />
      );
    });

    it('should render summary message', () => {
      expect(screen.getByText(labelIds.summaryMessageCharged)).toBeVisible();
    });
  });
});
