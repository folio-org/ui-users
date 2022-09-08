import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import ItemInfo from './ItemInfo';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderItemInfo = (props) => renderWithRouter(
  <ItemInfo {...props} />
);

const selectMock = jest.fn();

const props = {
  onClickSelectItem: selectMock,
  item: {},
  editable: true
};

describe('Item Info component', () => {
  it('if it renders', () => {
    renderItemInfo(props);
    expect(screen.getByText('ui-users.charge.item.title')).toBeInTheDocument();
  });
  it('Charge Item Button', () => {
    renderItemInfo(props);
    userEvent.click(screen.getByText('ui-users.charge.item.button'));
    expect(selectMock).toHaveBeenCalled();
  });
  it('charge item text field', () => {
    renderItemInfo(props);
    userEvent.type(document.querySelector('[placeholder="ui-users.charge.item.placeholder"]'), 'Test');
    expect(document.querySelector('[placeholder="ui-users.charge.item.placeholder"]').value).toBe('Test');
  });
});
