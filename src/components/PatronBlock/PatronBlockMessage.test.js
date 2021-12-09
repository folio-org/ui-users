import { screen } from '@testing-library/react';
import '__mock__/stripesCore.mock';

import renderWithRouter from 'helpers/renderWithRouter';
import PatronBlockMessage from './PatronBlockMessage';


jest.unmock('@folio/stripes/components');

const renderPatronBlockMessage = (props = {}) => renderWithRouter(<PatronBlockMessage {...props} />);

describe('Patron Block Message component', () => {
  it('it must contain the textbox and alert elements', () => {
    renderPatronBlockMessage();
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
