import { render } from '@folio/jest-config-stripes/testing-library/react';
import {
  FormattedDate,
  FormattedTime,
} from 'react-intl';

import '../../../../../../../../test/jest/__mock__';

import DateTimeFormatter from './DateTimeFormatter';

describe('DateTimeFormatter', () => {
  const value = 'date-time value';

  beforeEach(() => {
    render(
      <DateTimeFormatter value={value} />
    );
  });

  const expectedProps = {
    value,
  };

  it('should trigger "FormattedDate" with correct props', () => {
    expect(FormattedDate).toHaveBeenCalledWith(expectedProps, {});
  });

  it('should trigger "FormattedTime" with correct props', () => {
    expect(FormattedTime).toHaveBeenCalledWith(expectedProps, {});
  });
});
