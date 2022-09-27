import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import ProxyViewList from './ProxyViewList';

import '__mock__/stripesCore.mock';
import '__mock__/stripesSmartComponent.mock';

jest.unmock('@folio/stripes/components');

const renderProxyViewList = (props) => renderWithRouter(<ProxyViewList {...props} />);
const STRIPES = {
    config: {},
    hasPerm: jest.fn().mockReturnValue(true),
  };
const props = (data, name) => {
  return {
    records: data,
    itemComponent: jest.fn(),
    name: name,
    label: <div>Label</div>,
    stripes: STRIPES,
  };
};

  describe('Checking ProxyViewList ', () => {
    it('if it renders', () => {
      const data = [];
      renderProxyViewList(props(data,""));
      expect(screen.getByText('ui-users.permissions.noProxiesFound')).toBeTruthy();
    });
    it('checking sponsers', () => {
        const data = [];
        renderProxyViewList(props(data,"sponsors"));
        expect(screen.getByText('ui-users.permissions.noSponsorsFound')).toBeTruthy();
      });
      it('checking non sponsers', () => {
        const data = [];
        renderProxyViewList(props(data,"sponsors1"));
        expect(screen.getByText('ui-users.permissions.noProxiesFound')).toBeTruthy();
      });
      
    
  });

