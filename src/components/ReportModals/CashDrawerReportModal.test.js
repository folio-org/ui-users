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
  values = {},
  cashDrawerReportSources = {
    POST: jest.fn()
  },
  intl = {},
  form = {},
  servicePoints = [
    { name: 'Online', id: 'id1' },
    { name: 'Circ Desc 1', id: 'id2' },
    { name: 'Circ Desc 2', id: 'id3' }
  ],
  initialValues = {},
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
        initialValues={initialValues}
        values={values}
        intl={intl}
        form={form}
        cashDrawerReportSources={cashDrawerReportSources}
        dismissible="true"
      />
    </Router>
  );
};

describe('Cash drawer reconciliation modal', () => {
  let cashDrawerModal;

  describe('with correct data', () => {
    beforeEach(() => {
      cashDrawerModal = renderCashDrawerReportModal({
        initialValues: {
          format: 'both',
          servicePoint: 'Online',
          sources: ['ADMIN'],
          startDate: '2020-05-11',
          endDate: '2021-05-11'
        }
      });
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
      expect(screen.getByText(modalHeader)).toBeInTheDocument();
    });
  });

  describe('with format', () => {
    beforeEach(() => {
      cashDrawerModal = renderCashDrawerReportModal({
        initialValues: {
          sources: [],
          startDate: '2020-05-11',
          endDate: '2021-05-11'
        }
      });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = cashDrawerModal;
      const form = container.querySelector('form');

      expect(container).toBeVisible();
      expect(form).toBeVisible();
    });
  });

  describe('with empty dates', () => {
    beforeEach(() => {
      cashDrawerModal = renderCashDrawerReportModal({
        initialValues: {
          sources: [],
          startDate: '',
          endDate: ''
        }
      });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = cashDrawerModal;
      const form = container.querySelector('form');

      expect(container).toBeVisible();
      expect(form).toBeVisible();
    });
  });

  describe('with empty start date', () => {
    beforeEach(() => {
      cashDrawerModal = renderCashDrawerReportModal({
        initialValues: {
          sources: [],
          startDate: '',
          endDate: '2021-05-11'
        }
      });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = cashDrawerModal;
      const form = container.querySelector('form');

      expect(container).toBeVisible();
      expect(form).toBeVisible();
    });
  });

  describe('with empty start date after end date', () => {
    beforeEach(() => {
      cashDrawerModal = renderCashDrawerReportModal({
        initialValues: {
          sources: [],
          startDate: '2025-05-12',
          endDate: '2021-05-11'
        }
      });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = cashDrawerModal;
      const form = container.querySelector('form');

      expect(container).toBeVisible();
      expect(form).toBeVisible();
    });
  });
});
