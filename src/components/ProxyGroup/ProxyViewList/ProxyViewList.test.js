import { screen } from '@testing-library/react';
import renderWithRouter from 'helpers/renderWithRouter';
import ProxyViewList from './ProxyViewList';


const renderProxyViewList = (props) => renderWithRouter(<ProxyViewList {...props} />);
const STRIPES = {
  config: {},
  hasPerm: jest.fn().mockReturnValue(true),
};

const props = (data, itemname) => {
  return {
    records: data,
    itemComponent: ({ record }) => <div>{record.name}</div>,
    name: itemname,
    label: <div>Label</div>,
    stripes: STRIPES,
  };
};

describe('Checking ProxyViewList ', () => {
  it('if it renders', () => {
    const data = [];
    renderProxyViewList(props(data, ''));
    expect(screen.getByText('ui-users.permissions.noProxiesFound')).toBeTruthy();
  });
  it('checking sponsors', () => {
    const data = [];
    renderProxyViewList(props(data, 'sponsors'));
    expect(screen.getByText('ui-users.permissions.noSponsorsFound')).toBeTruthy();
  });
  it('checking non sponsors', () => {
    const data = [];
    renderProxyViewList(props(data, 'sponsors1'));
    expect(screen.getByText('ui-users.permissions.noProxiesFound')).toBeTruthy();
  });
  it('Displaying items when items are not empty', () => {
    const data = [{ name: 'apple' }, { name: 'banana' }];
    renderProxyViewList(props(data, ''));
    expect(screen.getByText('apple')).toBeInTheDocument();
    expect(screen.getByText('banana')).toBeInTheDocument();
  });
});
