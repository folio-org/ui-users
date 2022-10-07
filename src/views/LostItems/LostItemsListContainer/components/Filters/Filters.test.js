import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import '../../../../../../test/jest/__mock__';

import {
  ITEM_STATUSES_TRANSLATIONS_KEYS,
} from '../../../constants';
import {
  itemStatuses,
} from '../../../../../constants';

import Filters from './Filters';

const testIds = {
  lossTypeFilterAccordion: 'lossTypeFilterAccordion',
};
const labelIds = {
  agedToLostLabel: ITEM_STATUSES_TRANSLATIONS_KEYS[itemStatuses.AGED_TO_LOST],
  declaredLostLabel: ITEM_STATUSES_TRANSLATIONS_KEYS[itemStatuses.DECLARED_LOST],
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
    it('should render loss type accordion', () => {
      expect(screen.getByTestId(testIds.lossTypeFilterAccordion)).toBeVisible();
    });

    it('should render aged to lost label', () => {
      expect(screen.getByText(labelIds.agedToLostLabel)).toBeVisible();
    });

    it('should render declared lost label', () => {
      expect(screen.getByText(labelIds.declaredLostLabel)).toBeVisible();
    });
  });
});
