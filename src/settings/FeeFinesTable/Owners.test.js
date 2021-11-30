import renderWithRouter from 'helpers/renderWithRouter';
import Owners from './Owners';


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
          owner: 'Shared'
        }
      ]
    };
    renderOwners(props);
    expect(renderOwners(props)).toBeTruthy();
  });
  it('Checking Shared Owners', () => {
    const props = {
      onChange: jest.fn(),
      filterShared: false,
      dataOptions: [
        {
          id: 'test1256',
          owner: 'Shared'
        }
      ]
    };
    renderOwners(props);
    expect(renderOwners(props)).toBeTruthy();
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
