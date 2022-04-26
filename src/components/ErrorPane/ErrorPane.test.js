import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import ErrorPane from './ErrorPane';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderErrorPane = (props) => renderWithRouter(
  <ErrorPane {...props}>
    <span>Testing Error Pane</span>
  </ErrorPane>
);

describe('Error Pane component', () => {
  describe('Checking Error Pane', () => {
    it('if it renders', () => {
      renderErrorPane();
      expect(screen.getByText('Testing Error Pane')).toBeInTheDocument();
    });
  });
});
