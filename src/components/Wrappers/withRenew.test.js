import React from 'react';
import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import '__mock__/currencyData.mock';
import '__mock__/stripesCore.mock';
import '__mock__/intl.mock';
import buildStripes from '__mock__/stripes.mock';
import withRenew from './withRenew';

const BulkRenewalDialogMock = ({ errorMessages }) => {
  return <div>{errorMessages?.[1]?.props?.values?.message ?? ''}</div>;
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
  match: { params: { id: '1' } },
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
});
