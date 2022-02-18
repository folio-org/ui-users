import React from 'react';
import { Router } from 'react-router-dom';
import {
  render,
  cleanup,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { FormattedMessage } from 'react-intl';

import '__mock__';
import SectionPageItem from './SectionPageItem';

const renderSectionPageItem = ({ setting, path }) => {
  const history = createMemoryHistory();
  return render(
    <Router history={history}>
      <SectionPageItem
        setting={setting}
        path={path}
      />
    </Router>
  );
};

describe('Settings SectionPageItem', () => {
  let sectionPageItem;

  describe('vanilla', () => {
    beforeEach(() => {
      sectionPageItem = renderSectionPageItem({
        setting: {
          route: 'some-route',
          label: <FormattedMessage id="foo" />,
          component: <div />,
        },
        path: 'funky-chicken',
      });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = sectionPageItem;
      const sectionContent = container.querySelector('[data-test-sectionpageitem]');
      expect(container).toBeVisible();
      expect(sectionContent).toBeVisible();
    });
  });



  describe('with interface present', () => {
    beforeEach(() => {
      sectionPageItem = renderSectionPageItem({
        setting: {
          route: 'some-route',
          label: <FormattedMessage id="foo" />,
          component: <div />,
          interface: 'interface',
        },
        path: 'funky-chicken'
      });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = sectionPageItem;
      const sectionContent = container.querySelector('[data-test-sectionpageitem]');
      expect(container).toBeVisible();
      expect(sectionContent).toBeVisible();
    });
  });

  describe('with interface absent', () => {
    beforeEach(() => {
      sectionPageItem = renderSectionPageItem({
        setting: {
          route: 'some-route',
          label: <FormattedMessage id="foo" />,
          component: <div />,
          interface: 'asdf',
        },
        path: 'funky-chicken'
      });
    });

    afterEach(cleanup);

    it('should not be rendered', () => {
      const { container } = sectionPageItem;
      const sectionContent = container.querySelector('[data-test-sectionpageitem]');
      expect(container).toBeVisible();
      expect(sectionContent).toBeNull();
    });
  });

  describe('with permissions present', () => {
    beforeEach(() => {
      sectionPageItem = renderSectionPageItem({
        setting: {
          route: 'some-route',
          label: <FormattedMessage id="foo" />,
          component: <div />,
          perm: 'permission',
        },
        path: 'funky-chicken'
      });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = sectionPageItem;
      const sectionContent = container.querySelector('[data-test-sectionpageitem]');
      expect(container).toBeVisible();
      expect(sectionContent).toBeVisible();
    });
  });

  describe('with permissions absent', () => {
    beforeEach(() => {
      sectionPageItem = renderSectionPageItem({
        setting: {
          route: 'some-route',
          label: <FormattedMessage id="foo" />,
          component: <div />,
          perm: 'asdf',
        },
        path: 'funky-chicken'
      });
    });

    afterEach(cleanup);

    it('should not be rendered', () => {
      const { container } = sectionPageItem;
      const sectionContent = container.querySelector('[data-test-sectionpageitem]');
      expect(container).toBeVisible();
      expect(sectionContent).toBeNull();
    });
  });
});
