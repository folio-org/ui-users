import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

import ItemLookup from './ItemLookup';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const onCloseMock = jest.fn();
const onChangeItemMock = jest.fn();

const renderItemLookup = (props) => render(<ItemLookup {...props} />);

const propData = {
  open: true,
  items:[{ id:'test1', barcode:'test', title:'test' }],
  onClose: onCloseMock,
  onChangeItem: onChangeItemMock,
};

describe('Item Lookup component', () => {
  it('Check if modal Renders', () => {
    renderItemLookup(propData);
    expect(screen.getByText('ui-users.charge.itemLookup.modalLabel')).toBeInTheDocument();
  });

  it('Onclose modal check', () => {
    renderItemLookup(propData);
    userEvent.click(screen.getByText('ui-users.charge.itemLookup.cancel'));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('Confirm is disabled until a row is selcted', () => {
    renderItemLookup(propData);
    expect(screen.getByRole('button', { name: /confirm/ })).toBeDisabled();
  });

  it('Checking Confirm button click after selecting row', () => {
    renderItemLookup(propData);
    userEvent.click(document.querySelector('[data-row-inner="0"]'));
    userEvent.click(screen.getByText('ui-users.charge.itemLookup.confirm'));
    expect(onChangeItemMock).toHaveBeenCalled();
  });
});
