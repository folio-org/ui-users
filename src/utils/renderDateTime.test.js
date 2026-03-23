import { render } from '@folio/jest-config-stripes/testing-library/react';
import { NoValue } from '@folio/stripes/components';

import renderDateTime from './renderDateTime';

describe('renderDateTime', () => {
  it('should render FormattedTime for a valid date value', () => {
    const { container } = render(renderDateTime('2024-01-01T00:00:00Z'));

    expect(container).not.toBeEmptyDOMElement();
  });

  it('should return NoValue for null', () => {
    const result = renderDateTime(null);

    expect(result.type).toBe(NoValue);
  });

  it('should return NoValue for undefined', () => {
    const result = renderDateTime(undefined);

    expect(result.type).toBe(NoValue);
  });

  it('should return FormattedTime element for a valid date string', () => {
    const result = renderDateTime('2024-06-15T10:30:00Z');

    expect(result.props.value).toBe('2024-06-15T10:30:00Z');
  });
});
