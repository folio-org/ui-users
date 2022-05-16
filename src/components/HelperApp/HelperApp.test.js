import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import '__mock__/stripesCore.mock';
import '__mock__/matchMedia.mock';

import HelperApp from './HelperApp';

const history = createMemoryHistory();

const renderHelperApp = (props) => render(<Router history={history}><HelperApp {...props} /></Router>);

const props = {
  match: {
    isExact: true,
    params: {
      id: '578a8413-dec9-4a70-a2ab-10ec865399f6',
      path: '/users/preview/:id',
      url: '578a8413-dec9-4a70-a2ab-10ec865399f6',
    }
  },
  appName: 'tags',
  onClose: jest.fn()
};

describe('Render Helper App', () => {
  it('Check if Component is rendered', () => {
    renderHelperApp(props);
    expect(screen.getByText('stripes-smart-components.tags')).toBeInTheDocument();
  });
  it('Check if Tags are added', () => {
    renderHelperApp(props);
    userEvent.type(document.querySelector('[id="multiselect-input-input-tag"]'), 'TestingTag');
    expect(screen.getByText('TestingTag')).toBeInTheDocument();
  });
});
