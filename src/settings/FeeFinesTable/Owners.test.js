import renderWithRouter from 'helpers/renderWithRouter';
import Owners from './Owners';
import { SHARED_OWNER } from '../../constants';

jest.unmock('@folio/stripes/components');

const renderOwners = (props) => renderWithRouter(<Owners {...props} />);

describe('Owners component', () => {
  it('Component must be rendered', () => {
    const props = {
      onChange: jest.fn(),
      filterShared: true,
      dataOptions: [
        {
          id: 'test1234',
          owner: 'test'
        },
        {
          id: 'test1256',
          owner: SHARED_OWNER
        }
      ]
    };
    renderOwners(props);
    expect(document.querySelector('[ value="test1256"]')).toBeFalsy();
    expect(document.querySelector('[ value="test1234"]')).toBeTruthy();
  });
  it('Checking Shared Owners', () => {
    const props = {
      onChange: jest.fn(),
      filterShared: false,
      dataOptions: [
        {
          id: 'test1256',
          owner: SHARED_OWNER,
        }
      ]
    };
    renderOwners(props);
    expect(document.querySelector('[ value="test1256"]')).toBeTruthy();
  });
  it('Check for empty data', () => {
    const props = {
      onChange: jest.fn(),
      filterShared: false,
      dataOptions: [],
    };
    renderOwners(props);
    expect(renderOwners(props)).toBeTruthy();
  });
});
