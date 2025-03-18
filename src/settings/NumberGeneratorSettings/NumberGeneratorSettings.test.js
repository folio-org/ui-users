import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { StripesContext } from '@folio/stripes/core';
import { ConfigManager } from '@folio/stripes/smart-components';

import NumberGeneratorSettings from './NumberGeneratorSettings';
import { NUMBER_GENERATOR_SETTINGS_KEY, NUMBER_GENERATOR_SETTINGS_SCOPE } from './constants';

jest.mock('@folio/stripes/smart-components', () => ({
  ConfigManager: jest.fn(() => <div data-testid="config-manager" />),
}));

describe('NumberGeneratorSettings', () => {
  it('renders ConfigManager with correct props', () => {
    const mockStripes = {
      connect: jest.fn((component) => component),
    };

    render(
      <StripesContext.Provider value={mockStripes}>
        <NumberGeneratorSettings />
      </StripesContext.Provider>
    );

    expect(screen.getByTestId('config-manager')).toBeInTheDocument();
    expect(ConfigManager).toHaveBeenCalledWith(
      expect.objectContaining({
        configName: NUMBER_GENERATOR_SETTINGS_KEY,
        scope: NUMBER_GENERATOR_SETTINGS_SCOPE,
      }),
      expect.any(Object)
    );
  });
});
