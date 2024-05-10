import { cleanup, render } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes } from '@folio/stripes/core';
import Settings from './index';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useStripes: jest.fn(),
}));

jest.mock('./components/SettingsPage', () => () => <div>Settings page</div>);

const renderSettings = (props) => render(<Settings {...props}>Settings content</Settings>);

describe('Settings component', () => {
  afterAll(() => {
    cleanup();
    jest.clearAllMocks();
  });
  it('renders with roles interface', () => {
    useStripes.mockClear().mockReturnValue({ hasInterface: () => true });
    const { getByText } = renderSettings({ match:{ path: '' } });

    expect(getByText('Settings content')).toBeInTheDocument();
  });

  it('renders with NO roles interface', () => {
    useStripes.mockClear().mockReturnValue({ hasInterface: () => false });
    const { getByText } = renderSettings({ match:{ path: '' } });

    expect(getByText('Settings content')).toBeInTheDocument();
  });
});


