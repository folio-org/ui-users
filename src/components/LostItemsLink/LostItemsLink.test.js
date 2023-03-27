import {
  screen,
  render,
} from '@testing-library/react';
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

describe('LostItemsLink', () => {
  beforeEach(() => {
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <LostItemsLink />
      </Router>
    );
  });

  it('should be rendered', () => {
    const lostItemsLink = screen.getByTestId(testIds.lostItemsLink);

    expect(lostItemsLink).toBeInTheDocument();
  });

  it('should have correct label', () => {
    const lostItemsLabel = screen.getByText(labelIds.lostItems);

    expect(lostItemsLabel).toBeInTheDocument();
  });

  it('should trigger "Button" with correct props', () => {
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
});
