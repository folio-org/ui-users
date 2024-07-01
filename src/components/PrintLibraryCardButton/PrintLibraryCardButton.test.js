import { screen, render } from '@folio/jest-config-stripes/testing-library/react';
import PrintLibraryCardButton from './PrintLibraryCardButton';

describe('PrintLibraryCard', () => {
  beforeEach(() => {
    render(<PrintLibraryCardButton />);
  });

  it('should display print library card button', () => {
    expect(screen.getByText('ui-users.printLibraryCard')).toBeInTheDocument();
  });
});
