import { screen } from '@testing-library/react';


import { IfPermission } from '@folio/stripes/core';

//  import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';
import renderWithRouter from 'helpers/renderWithRouter';

import ItemDetailsOption from './ItemDetailsOption';

jest.unmock('@folio/stripes/components');

const renderItemDetailsOption = (props) => renderWithRouter(<ItemDetailsOption {...props} />);

describe('ItemDetailsOption component', () => {
  describe('with permission', () => {
    beforeEach(() => {
      IfPermission.mockImplementation(({ _, children }) => children);
    });
    it('With loan item', () => {
      const props = {
        loan: {
          item: {
            instanceId: 'foo'
          }
        }
      };

      renderItemDetailsOption(props);
      expect(screen.getByText('ui-users.itemDetails')).toBeTruthy();
    });

    it('Without loan item', () => {
      const props = {
        loan: {
        }
      };

      renderItemDetailsOption(props);
      expect(screen.queryByText('ui-users.itemDetails')).toBeFalsy();
    });
  });

  describe('without permission', () => {
    beforeEach(() => {
      IfPermission.mockImplementation(() => null);
    });

    it('Without permission', () => {
      const props = {
        loan: {
          item: {
            instanceId: 'foo'
          }
        }
      };

      renderItemDetailsOption(props);
      expect(screen.queryByText('ui-users.itemDetails')).toBeFalsy();
    });
  });
});
