import {
  render,
  screen,
} from '@testing-library/react';

import { Button } from '@folio/stripes/components';

import '../../../../../../../../../../test/jest/__mock__';
import FeeFineDetailsLink from './FeeFineDetailsLink';
import { LOST_ITEM_STATUSES } from '../../../../../../../constants';

const testIds = {
  feeFineDetailsLink: 'feeFineDetailsLink',
};
const labelIds = {
  feeFineDetails: 'ui-users.lostItems.list.columnName.action.feeFineDetails',
};

describe('FeeFineDetailsLink', () => {
  const basicProps = {
    actualCostRecord: {
      status: LOST_ITEM_STATUSES.BILLED,
      id: 'id',
      user: {
        id: 'userId',
      },
      feeFine: {
        accountId: 'accountId',
      },
    },
    billedRecords: [
      {
        id: 'id',
        feeFineId: 'feeFineId',
      },
    ],
    isBilled: false,
  };
  const expectedButtonProps = {
    buttonStyle: 'dropdownItem',
    disabled: false,
    onClick: expect.any(Function),
  };

  describe('when status is "Billed"', () => {
    beforeEach(() => {
      render(
        <FeeFineDetailsLink
          {...basicProps}
        />
      );
    });

    it('should be rendered', () => {
      const feeFineDetailsLink = screen.getByTestId(testIds.feeFineDetailsLink);

      expect(feeFineDetailsLink).toBeInTheDocument();
    });

    it('should render button label', () => {
      const feeFineDetailsLabel = screen.getByText(labelIds.feeFineDetails);

      expect(feeFineDetailsLabel).toBeInTheDocument();
    });

    it('should trigger "Button" with correct props', () => {
      expect(Button).toHaveBeenCalledWith(expect.objectContaining(expectedButtonProps), {});
    });
  });

  describe('when status "isBilled" is true', () => {
    const props = {
      ...basicProps,
      actualCostRecord: {
        ...basicProps.actualCostRecord,
        status: LOST_ITEM_STATUSES.OPEN,
      },
      isBilled: true
    };

    beforeEach(() => {
      render(
        <FeeFineDetailsLink
          {...props}
        />
      );
    });

    it('should trigger "Button" with correct props', () => {
      expect(Button).toHaveBeenCalledWith(expect.objectContaining(expectedButtonProps), {});
    });
  });
});
