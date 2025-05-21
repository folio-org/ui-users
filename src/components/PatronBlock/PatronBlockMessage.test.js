import { screen } from '@folio/jest-config-stripes/testing-library/react';
import '__mock__/stripesCore.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import PatronBlockMessage from './PatronBlockMessage';


jest.unmock('@folio/stripes/components');

const renderPatronBlockMessage = (props = {}) => renderWithRouter(<PatronBlockMessage {...props} />);

describe('Patron Block Message component', () => {
  it('it must contain the textbox and alert elements', () => {
    renderPatronBlockMessage();

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('ui-users.blocks.textField.place')).toBeVisible();
  });
});
