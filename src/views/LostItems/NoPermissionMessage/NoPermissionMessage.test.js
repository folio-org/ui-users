import React from 'react';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import NoPermissionMessage from './NoPermissionMessage';

const testIds = {
  noPermissionWrapper: 'noPermissionWrapper',
};

describe('NoPermissionMessage', () => {
  beforeEach(() => {
    render(<NoPermissionMessage id="ui-users.lostItems.message.noAccessToActualCostPage" />);
  });

  it('should render noPermissionWrapper', () => {
    expect(screen.getByTestId(testIds.noPermissionWrapper)).toBeInTheDocument();
  });

  it('should not render noAccessToActualCostPage message', () => {
    expect(screen.getByText('ui-users.lostItems.message.noAccessToActualCostPage')).toBeInTheDocument();
  });
});
