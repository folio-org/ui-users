import { screen } from '@testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';
import ContributorsView from './ContributorsView';

jest.unmock('@folio/stripes/components');

const renderContributorsView = (props) => renderWithRouter(<ContributorsView {...props} />);

describe('render contributions view component', () => {
  it('for single contributor', () => {
    const props = {
      contributorsList: ['Fielding, Helen'],
    };
    renderContributorsView(props);
    expect(screen.getByText('Fielding, Hel')).toBeInTheDocument();
  });
  it('for no contributors', () => {
    const props = {
      contributorsList: [],
    };
    renderContributorsView(props);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
  it('For multiple contributors', () => {
    const props = {
      contributorsList: ['sample', 'sample 2', 'sample 3'],
    };
    renderContributorsView(props);
    expect(screen.getByText('sample, sample 2...')).toBeInTheDocument();
  });
});
