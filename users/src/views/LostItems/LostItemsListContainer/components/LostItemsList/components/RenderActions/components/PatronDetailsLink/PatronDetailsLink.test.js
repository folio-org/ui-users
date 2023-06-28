import React from 'react';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../../../../../../../../test/jest/__mock__';

import PatronDetailsLink from './PatronDetailsLink';

const testIds = {
  patronDetailsLink: 'patronDetailsLink',
};
const labelIds = {
  patronDetailsLabel: 'ui-users.lostItems.list.columnName.action.patronDetails',
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

describe('PatronDetailsLink', () => {
  beforeEach(() => {
    render(
      <PatronDetailsLink
        {...initialProps}
      />
    );
  });

  it('should render link', () => {
    expect(screen.getByTestId(testIds.patronDetailsLink)).toBeVisible();
  });

  it('should render label', () => {
    expect(screen.getByText(labelIds.patronDetailsLabel)).toBeVisible();
  });

  it('should have correct props', () => {
    const dropdownButton = screen.getByTestId(testIds.patronDetailsLink);

    expect(dropdownButton).toHaveAttribute('to', '/users/preview/88805c06-dbdb-4aa0-9695-d4d19c733221');
  });
});
