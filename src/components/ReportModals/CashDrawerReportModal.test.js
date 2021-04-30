import React from 'react';
import { Router } from 'react-router-dom';
import {
  render,
  cleanup,
  screen,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';

import '../../../test/jest/__mock__';
import CashDrawerReportModal from './CashDrawerReportModal';

const modalHeader = 'Cash drawer reconciliation modal';
const renderCashDrawerReportModal = ({
  label = modalHeader,
  onClose = jest.fn(),
  handleSubmit = jest.fn(),
  values = {
    format: 'both',
    servicePoint:'Online'
  },
  resources = {
    feefineactions: {
      records: [],
    },
  },
  intl = {},
  form = {},
  servicePoints = [
    { name: 'Online', id: 'id1' },
    { name: 'Circ Desc 1', id: 'id2' },
    { name: 'Circ Desc 2', id: 'id3' }
  ]
}) => {
  const history = createMemoryHistory();
  return render(
    <Router history={history}>
      <CashDrawerReportModal
        open
        label={label}
        servicePoints={servicePoints}
        timezone="America/New_York"
        onClose={onClose}
        onSubmit={handleSubmit}
        initialValues={{ format: 'both' }}
        resources={resources}
        values={values}
        intl={intl}
        form={form}
      />
    </Router>
  );
};

describe('Cash drawer reconciliation modal', () => {
  let cashDrawerModal;

  beforeEach(() => {
    cashDrawerModal = renderCashDrawerReportModal({});
  });

  afterEach(cleanup);

  it('should be rendered', () => {
    const { container } = cashDrawerModal;
    const modalContent = container.querySelector('[data-test-cash-drawer-report-modal]');
    const modalMainHeader = container.querySelector('[data-test-cash-drawer-report-modal] h1');
    const form = container.querySelector('form');

    expect(container).toBeVisible();
    expect(modalContent).toBeVisible();
    expect(modalMainHeader).toBeVisible();
    expect(form).toBeVisible();
    // expect(screen.getByDisplayValue(modalHeader)).toBeInTheDocument();
    expect(screen.getByText(modalHeader)).toBeInTheDocument();
  });
});
