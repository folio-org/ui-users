import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { Button } from '@folio/stripes/components';

import '../../../test/jest/__mock__';

import LostItemsLink from './LostItemsLink';
import {
  ACTUAL_COST_RECORD_FIELD_NAME,
  ACTUAL_COST_RECORD_FIELD_PATH,
  LOST_ITEM_STATUSES,
} from '../../views/LostItems/constants';

const testIds = {
  lostItemsLink: 'lostItemsLink',
};
const labelIds = {
  lostItems: 'ui-users.actionMenu.lostItems',
};

const renderLostItemsLink = ({ disabled = false }) => {
  const history = createMemoryHistory();
  render(
    <Router history={history}>
      <LostItemsLink disabled={disabled} />
    </Router>
  );
};

describe('LostItemsLink', () => {
  it('should be rendered', () => {
    renderLostItemsLink({ disabled: false });
    const lostItemsLink = screen.getByTestId(testIds.lostItemsLink);

    expect(lostItemsLink).toBeInTheDocument();
  });

  it('should have correct label', () => {
    renderLostItemsLink({ disabled: false });
    const lostItemsLabel = screen.getByText(labelIds.lostItems);

    expect(lostItemsLabel).toBeInTheDocument();
  });

  it('should trigger "Button" with correct props', () => {
    renderLostItemsLink({ disabled: false });

    const expectedProps = {
      buttonStyle: 'dropdownItem',
      to: {
        pathname: '/users/lost-items',
        search: `?filters=${ACTUAL_COST_RECORD_FIELD_PATH[ACTUAL_COST_RECORD_FIELD_NAME.STATUS]}.${LOST_ITEM_STATUSES.OPEN}`,
        state: {
          pathname: '/',
          search: '',
        },
      }
    };

    expect(Button).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });

  it('should button be disabled', () => {
    renderLostItemsLink({ disabled: true });
    const lostItemsLink = screen.getByRole('button');

    expect(lostItemsLink).toBeDisabled();
  });
});
