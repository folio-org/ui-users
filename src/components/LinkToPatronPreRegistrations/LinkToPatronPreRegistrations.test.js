import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import '../../../test/jest/__mock__';

import LinkToPatronPreRegistrations from './LinkToPatronPreRegistrations';

describe('LinkToPatronPreRegistrations', () => {
  beforeEach(() => {
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <LinkToPatronPreRegistrations />
      </Router>
    );
  });

  it('should render button', () => {
    expect(screen.getByText('ui-users.actionMenu.preRegistrationRecords')).toBeInTheDocument();
  });
});
