import React from 'react';
import { Router } from 'react-router-dom';
import {
  cleanup,
  render,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';

import '__mock__';
import TransferCriteriaSettings from './TransferCriteriaSettings';

const renderTransferCriteriaSettings = () => {
  const history = createMemoryHistory();
  return render(
    <Router history={history}>
      <TransferCriteriaSettings />
    </Router>
  );
};

describe('Transfer criteria settings page', () => {
  let transferCriteriaSettings;

  beforeEach(() => {
    transferCriteriaSettings = renderTransferCriteriaSettings();
  });

  afterEach(cleanup);

  it('should be rendered', () => {
    const { container } = transferCriteriaSettings;
    const content = container.querySelector('[data-test-transfercriteriasettings]');

    expect(container).toBeVisible();
    expect(content).toBeVisible();
  });
});
