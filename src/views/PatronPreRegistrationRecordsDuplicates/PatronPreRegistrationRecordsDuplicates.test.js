import { screen } from '@folio/jest-config-stripes/testing-library/react';

import renderWithRouter from 'helpers/renderWithRouter';

import PatronPreRegistrationRecordsDuplicates from './PatronPreRegistrationRecordsDuplicates';

const renderComponent = (props) => renderWithRouter(
  <PatronPreRegistrationRecordsDuplicates {...props} />
);

describe('PatronsPreRegistrationListContainer', () => {
  it('should render component', () => {
    renderComponent();

    expect(screen.getByText('ui-users.stagingRecords.duplicates.results.paneTitle')).toBeInTheDocument();
  });
});
