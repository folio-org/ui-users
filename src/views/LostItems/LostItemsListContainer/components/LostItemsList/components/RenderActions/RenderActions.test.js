import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import '../../../../../../../../test/jest/__mock__';

import RenderActions from './RenderActions';

const testIds = {
  lostItemsListActionsDropdown: 'lostItemsListActionsDropdown',
  lostItemsListActionsDropdownMenu: 'lostItemsListActionsDropdownMenu',
};
const initialProps = {
  actualCostRecord: {
    user: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733221',
    },
    loan: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733222',
    },
    item: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733223',
      holdingsRecordId: '88805c06-dbdb-4aa0-9695-d4d19c733224',
    },
    instance: {
      id: '88805c06-dbdb-4aa0-9695-d4d19c733225',
    },
  },
};

describe('RenderActions', () => {
  beforeEach(() => {
    render(
      <RenderActions
        {...initialProps}
      />
    );
  });

  it('should render dropdown', () => {
    expect(screen.getByTestId(testIds.lostItemsListActionsDropdown)).toBeVisible();
  });

  it('should render dropdown menu', () => {
    expect(screen.getByTestId(testIds.lostItemsListActionsDropdownMenu)).toBeVisible();
  });
});
