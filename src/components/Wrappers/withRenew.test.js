import React from 'react';
import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import '__mock__/currencyData.mock';
import '__mock__/stripesCore.mock';
import '__mock__/intl.mock';
import buildStripes from '__mock__/stripes.mock';
import withRenew from './withRenew';
import {
  BACKEND_ERROR_CODES,
  ERROR_MESSAGE_TRANSLATION_ID_BY_BACKEND_ERROR_CODES,
} from '../../constants';

const BulkRenewalDialogMock = ({ errorMessages }) => {
  const err = errorMessages?.[1];
  return (
    <div>
      <span data-testid="error-wrapper-id">{err?.props?.id ?? ''}</span>
      <span data-testid="error-message">{err?.props?.values?.message ?? ''}</span>
    </div>
  );
};

jest.mock('../BulkRenewalDialog', () => BulkRenewalDialogMock);

const mutator = {
  loanPolicies: {
    GET: jest.fn(),
    reset: jest.fn(),
  },
  renew: {
    POST: jest.fn().mockReturnValue(Promise.resolve()),
  },
  requests: {
    GET: jest.fn().mockReturnValue(Promise.resolve()),
    reset: jest.fn(),
  },
};

const props = {
  mutator,
  intl: { formatMessage: ({ id }) => id },
  stripes: buildStripes({ connect: (Component) => Component }),
};

const Wrapper = ({ renew }) => (
  <button type="button" onClick={() => renew([{ id: 1, reminders: { renewalBlocked: true } }], { barcode: '123' })}>Renew</button>
);
const WrappedComponent = withRenew(Wrapper);
const renderWithRenew = (extraProps = {}) => render(<WrappedComponent {...props} {...extraProps} />);

describe('withRenew', () => {
  it('should renew loans', async () => {
    renderWithRenew();
    userEvent.click(screen.getByText('Renew'));

    await waitFor(() => {
      expect(screen.getByText('ui-users.errors.renewWithReminders')).toBeInTheDocument();
    });
  });

  describe('getMessage', () => {
    const loan = { id: 1, item: { barcode: 'item-001', title: 'Test Title' } };
    const patron = { barcode: 'patron-001' };

    const RenewWrapper = ({ renew }) => (
      <button type="button" onClick={() => renew([loan], patron)}>Renew Item</button>
    );
    const WrappedRenewItem = withRenew(RenewWrapper);

    const makeJsonRejection = (errors) => jest.fn().mockRejectedValue({
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ errors }),
    });

    const renderAndRenew = async (postMock) => {
      render(
        <WrappedRenewItem
          {...props}
          mutator={{ ...mutator, renew: { POST: postMock } }}
        />
      );
      await userEvent.click(screen.getByText('Renew Item'));
    };

    it('should uses the translation ID for a known error code', async () => {
      const errors = [{
        code: BACKEND_ERROR_CODES.loanRenewalLimitReached,
        message: 'loan at maximum renewal number',
        parameters: [],
      }];
      await renderAndRenew(makeJsonRejection(errors));

      const expectedTranslationId =
        ERROR_MESSAGE_TRANSLATION_ID_BY_BACKEND_ERROR_CODES[BACKEND_ERROR_CODES.loanRenewalLimitReached];

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(expectedTranslationId);
      });
    });

    it('should falls back to err.message for an unknown error code', async () => {
      const errors = [{
        code: 'UNKNOWN_ERROR_CODE',
        message: 'some unknown error',
        parameters: [],
      }];
      await renderAndRenew(makeJsonRejection(errors));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('some unknown error');
      });
    });

    it('should falls back to err.message when the error has no code', async () => {
      const errors = [{
        message: 'error without code',
        parameters: [],
      }];
      await renderAndRenew(makeJsonRejection(errors));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('error without code');
      });
    });

    it('should joins multiple error messages with ", "', async () => {
      const errors = [
        { code: 'UNKNOWN_1', message: 'first error', parameters: [] },
        { code: 'UNKNOWN_2', message: 'second error', parameters: [] },
      ];
      await renderAndRenew(makeJsonRejection(errors));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('first error, second error');
      });
    });

    it('should uses reviewBeforeRenewal wrapper when loanPolicyName is present in error parameters', async () => {
      const errors = [{
        code: BACKEND_ERROR_CODES.loanRenewalLimitReached,
        message: 'loan at maximum renewal number',
        parameters: [{ key: 'loanPolicyName', value: 'Test Policy' }],
      }];
      await renderAndRenew(makeJsonRejection(errors));

      await waitFor(() => {
        expect(screen.getByTestId('error-wrapper-id')).toHaveTextContent('ui-users.errors.reviewBeforeRenewal');
      });
    });

    it('should uses loanNotRenewedReason wrapper when loanPolicyName is absent', async () => {
      const errors = [{
        code: BACKEND_ERROR_CODES.loanRenewalLimitReached,
        message: 'loan at maximum renewal number',
        parameters: [],
      }];
      await renderAndRenew(makeJsonRejection(errors));

      await waitFor(() => {
        expect(screen.getByTestId('error-wrapper-id')).toHaveTextContent('ui-users.errors.loanNotRenewedReason');
      });
    });
  });
});
