import React from 'react';
import { Router } from 'react-router-dom';
import {
  render,
  cleanup,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { FormattedMessage } from 'react-intl';

import '__mock__';
import Monkey from './SettingsPage';

const renderSettingsPage = ({ sections, path }) => {
  const history = createMemoryHistory();
  return render(
    <Router history={history}>
      <Monkey
        sections={sections}
        path={path}
      />
    </Router>
  );
};

const pages = [
  {
    route: 'a',
    label: <FormattedMessage id="ui-users.settings.transferAccounts" />,
    component: <div />,
    perm: '',
  },
  {
    route: 'b',
    label: <FormattedMessage id="ui-users.settings.transferAccounts" />,
    component: <div />,
    perm: '',
  },
];

const label = <FormattedMessage id="foo" />;

describe('Settings', () => {
  let settingsPage;

  describe('vanilla', () => {
    beforeEach(() => {
      settingsPage = renderSettingsPage({
        sections: [{ label, pages }],
        path: 'funky',
      });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = settingsPage;
      const settingsContent = container.querySelector('[data-test-settingspage]');
      expect(container).toBeVisible();
      expect(settingsContent).toBeVisible();
    });
  });



  describe('with interface present', () => {
    beforeEach(() => {
      settingsPage = renderSettingsPage({
        sections: [{ label, pages, interface: 'interface' }],
        path: 'funky',
      });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = settingsPage;
      const settingsContent = container.querySelector('[data-test-settingspage]');
      expect(container).toBeVisible();
      expect(settingsContent).toBeVisible();
    });
  });

  describe('with interface absent', () => {
    beforeEach(() => {
      settingsPage = renderSettingsPage({
        sections: [{ label, pages, interface: 'asdf' }],
        path: 'funky',
      });
    });

    afterEach(cleanup);

    it('should not be rendered', () => {
      const { container } = settingsPage;
      const settingsContent = container.querySelector('[data-test-settingspage]');
      expect(container).toBeVisible();
      expect(settingsContent).toBeNull();
    });
  });
});
