import { screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import ItemLookup from './ItemLookup';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import { async } from 'regenerator-runtime';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

const onCloseMock = jest.fn();
const onChangeItemMock = jest.fn();
const onConfirmMock = jest.fn();

const renderItemLookup = (props) => renderWithRouter(<ItemLookup {...props} />);

const propData = {
  open: true,
  items:[],
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
  it('OnConfirm modal check', () => {
    renderItemLookup(propData);
    userEvent.click(screen.getByText('ui-users.charge.itemLookup.confirm'));
    expect(onConfirmMock).toHaveBeenCalled();
  });
});
