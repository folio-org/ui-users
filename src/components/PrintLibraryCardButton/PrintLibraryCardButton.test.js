import { screen, render } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { exportToCsv } from '@folio/stripes/components';

import PrintLibraryCardButton from './PrintLibraryCardButton';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  exportToCsv: jest.fn(),
  Icon: jest.fn((props) => (props && props.children ? props.children : <span />)),
}));

describe('PrintLibraryCard', () => {
  beforeEach(() => {
    const props = {
      user: {
        expirationDate: '2024-07-09T23:59:59.000+00:00',
        personal: {
          firstName: 'firstName',
          lastName: 'lastName',
        },
        patronGroup: 'patronGroupId'
      },
      patronGroup: 'patronGroup',
    };
    render(<PrintLibraryCardButton {...props} />);
  });

  it('should display print library card button', () => {
    expect(screen.getByText('ui-users.printLibraryCard')).toBeInTheDocument();
  });

  it('should export CSV file', async () => {
    const printLibraryCardButton = screen.getByTestId('print-library-card');
    await userEvent.click(printLibraryCardButton);

    expect(exportToCsv).toHaveBeenCalled();
  });
});
