import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import RenderPatronGroupNumberOfUsers from './PatronGroupNumberOfUsers';

jest.unmock('@folio/stripes/components');

const renderPatronBlockModal = (props) => renderWithRouter(<RenderPatronGroupNumberOfUsers {...props} />);

describe('PatronGroupNumberOfUsers component', () => {
  describe('RenderPatronGroupNumberOfUsers', () => {
    it('if it renders and gives the first count value', () => {
      const props = {
        item: {
          id: '123',
          group: 'Test'
        },
        usersPerGroup: {
          hasLoaded: true,
          other : {
            resultInfo: {
              facets: [{
                facetValues: [
                  { value: '123', count: 13 },
                  { value: '321', count: 12 }
                ],
              }]
            }
          },
        },
      };
      renderPatronBlockModal(props);
      expect(screen.getByText('13')).toBeInTheDocument();
      expect(document.querySelector('[href="/users/view?filters=pg.Test"]')).toBeTruthy();
    });
    it('if facet values and item id dont match it returns 0', () => {
      const props = {
        item: {
          id: '123',
          group: 'Test'
        },
        usersPerGroup: {
          hasLoaded: true,
          other : {
            resultInfo: {
              facets: [{
                facetValues: [
                  { value: '321', count: 13 },
                  { value: '321', count: 12 }
                ],
              }]
            }
          },
        },
      };
      renderPatronBlockModal(props);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
