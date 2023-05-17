import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../../../../test/jest/__mock__';

import {
  ITEM_LOSS_TYPES_TRANSLATIONS_KEYS,
  LOST_ITEM_STATUSES,
  LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS,
} from '../../../constants';
import {
  itemStatuses,
} from '../../../../../constants';

import Filters from './Filters';

const testIds = {
  lossTypeFilterAccordion: 'lossTypeFilterAccordion',
  statusFilterAccordion: 'statusFilterAccordion',
};
const labelIds = {
  agedToLost: ITEM_LOSS_TYPES_TRANSLATIONS_KEYS[itemStatuses.AGED_TO_LOST],
  declaredLost: ITEM_LOSS_TYPES_TRANSLATIONS_KEYS[itemStatuses.DECLARED_LOST],
  open: LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.OPEN],
  billed: LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.BILLED],
  cancelled: LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.CANCELLED],
  expired: LOST_ITEM_STATUS_FILTER_TRANSLATIONS_KEYS[LOST_ITEM_STATUSES.EXPIRED],
};
const initialProps = {
  activeFilters: {},
  onChangeHandlers: {
    clearGroup: jest.fn(),
  },
  resultOffset: {
    replace: jest.fn(),
  },
};

describe('Filters', () => {
  beforeEach(() => {
    render(
      <Filters
        {...initialProps}
      />
    );
  });

  describe('Loss type filter', () => {
    it('should render "Loss type" accordion', () => {
      expect(screen.getByTestId(testIds.lossTypeFilterAccordion)).toBeVisible();
    });

    it('should render "Aged to lost" label', () => {
      expect(screen.getByText(labelIds.agedToLost)).toBeVisible();
    });

    it('should render "Declared lost" label', () => {
      expect(screen.getByText(labelIds.declaredLost)).toBeVisible();
    });
  });

  describe('Status filter', () => {
    it('should render "Status" accordion', () => {
      expect(screen.getByTestId(testIds.statusFilterAccordion)).toBeVisible();
    });

    it('should render "Open" label', () => {
      expect(screen.getByText(labelIds.open)).toBeVisible();
    });

    it('should render "Billed" label', () => {
      expect(screen.getByText(labelIds.billed)).toBeVisible();
    });

    it('should render "Cancelled" label', () => {
      expect(screen.getByText(labelIds.cancelled)).toBeVisible();
    });

    it('should render "Expired" label', () => {
      expect(screen.getByText(labelIds.expired)).toBeVisible();
    });
  });
});
