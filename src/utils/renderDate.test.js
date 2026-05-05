import { render } from '@folio/jest-config-stripes/testing-library/react';
import { NoValue } from '@folio/stripes/components';

import renderDate from './renderDate';

describe('renderDate', () => {
  it('should render FormattedUTCDate for a valid date value', () => {
    const { container } = render(renderDate('2024-01-01T00:00:00Z'));

    expect(container).not.toBeEmptyDOMElement();
  });

  it('should return NoValue for null', () => {
    const result = renderDate(null);

    expect(result.type).toBe(NoValue);
  });

  it('should return NoValue for undefined', () => {
    const result = renderDate(undefined);

    expect(result.type).toBe(NoValue);
  });

  it('should pass the raw value to FormattedUTCDate', () => {
    const result = renderDate('2024-06-15');

    expect(result.props.value).toBe('2024-06-15');
  });
});
