import React from 'react';
import { Router } from 'react-router-dom';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { forEach } from 'lodash';

import FinancialTransactionsReportModal, { validate } from './FinancialTransactionsReportModal';

const modalHeader = 'Financial transaction detail report';
const renderFinancialTransactionsReportModal = ({
  label = modalHeader,
  onClose = jest.fn(),
  handleSubmit = jest.fn(),
  values = {},
  intl = {},
  form = {},
  owners = [
    {
      id: 'id-owner1',
      owner: 'Owner1',
      servicePointOwner: [
        {
          label: 'Circ Desk 1',
          value: 'id2'
        },
        {
          label: 'Circ Desk 2',
          value: 'id3'
        }
      ]
    },
    {
      id: 'id-owner2',
      owner: 'Owner2',
      servicePointOwner: [
        {
          label: 'Online',
          value: 'id1'
        }
      ]
    }
  ],
  servicePoints = [
    { name: 'Online', id: 'id1' },
    { name: 'Circ Desc 1', id: 'id2' },
    { name: 'Circ Desc 2', id: 'id3' }
  ],
}) => {
  const history = createMemoryHistory();
  return render(
    <Router history={history}>
      <FinancialTransactionsReportModal
        open
        label={label}
        servicePoints={servicePoints}
        timezone="America/New_York"
        onClose={onClose}
        onSubmit={handleSubmit}
        values={values}
        intl={intl}
        form={form}
        owners={owners}
        dismissible="true"
      />
    </Router>
  );
};

describe('Financial transactions report modal', () => {
  let financialTransactionsModal;
  const values = {
    startDate: '2021-07-01',
    endDate: '2021-07-06',
    feeFineOwner: 'id-owner1',
    servicePoint: [
      {
        label: 'Circ Desk 1',
        value: 'id2'
      },
      {
        label: 'Circ Desk 2',
        value: 'id3'
      }
    ]
  };

  describe('with correct data', () => {
    beforeEach(() => {
      financialTransactionsModal = renderFinancialTransactionsReportModal({ values });
    });

    afterEach(cleanup);

    it('should be rendered', () => {
      const { container } = financialTransactionsModal;
      const modalContent = container.querySelector('[data-test-financial-transactions-report-modal]');
      const modalMainHeader = container.querySelector('[data-test-financial-transactions-report-modal] h1');
      const form = container.querySelector('form');

      expect(container).toBeVisible();
      expect(modalContent).toBeVisible();
      expect(modalMainHeader).toBeVisible();
      expect(form).toBeVisible();
      expect(screen.getByText(modalHeader)).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    const customRender = (options) => {
      let validationError = '';

      forEach(validate(options), (error) => {
        validationError = error;
      });

      return render(
        <div data-testid="validation-error">
          {validationError}
        </div>,
      );
    };

    it('should return validation error for start date', () => {
      const options = {
        startDate: '',
        endDate: '',
        feeFineOwner: 'id-owner1',
      };

      customRender(options);

      expect(screen.getByTestId('validation-error').textContent).toBe('ui-users.reports.cash.drawer.report.startDate.error');
    });

    it('should return validation error for end date without start date', () => {
      const options = {
        startDate: '',
        endDate: '2021-06-15',
        feeFineOwner: 'id-owner1',
      };

      customRender(options);

      expect(screen.getByTestId('validation-error').textContent).toBe('ui-users.reports.cash.drawer.report.endDateWithoutStart.error');
    });

    it('should return validation error for end date', () => {
      const options = {
        startDate: '2021-06-30',
        endDate: '2021-06-15',
        feeFineOwner: 'id-owner1',
      };

      customRender(options);

      expect(screen.getByTestId('validation-error').textContent).toBe('ui-users.reports.cash.drawer.report.endDate.error');
    });

    it('should return validation error for owner', () => {
      const options = {
        startDate: '2021-06-15',
        endDate: '2021-06-30',
        feeFineOwner: '',
      };

      customRender(options);

      expect(screen.getByTestId('validation-error').textContent).toBe('ui-users.reports.financial.trans.modal.owners.error');
    });

    it('should not return validation error', () => {
      const options = {
        startDate: '2021-06-15',
        endDate: '2021-06-30',
        feeFineOwner: 'id-owner1',
        servicePoint: []
      };

      customRender(options);

      expect(screen.getByTestId('validation-error').textContent).toBe('');
    });
  });
});
