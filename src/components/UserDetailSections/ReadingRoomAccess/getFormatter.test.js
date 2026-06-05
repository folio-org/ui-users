import { screen, render } from '@folio/jest-config-stripes/testing-library/react';

import { getFormatter } from './getFormatter';
import { rraColumns } from './constant';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  ViewMetaData: ({ children }) => {
    if (children) {
      return children({
        lastUpdatedBy: {
          personal: {
            lastName: 'Smith',
            firstName: 'John',
          },
        },
      });
    }
    return null;
  },
}));

const lastUpdatedDetailsMock = jest.fn((lastUpdatedBy, date) => (
  <span data-testid="last-updated-details">{`${date}`}</span>
));

describe('getFormatter', () => {
  let formatter;

  beforeEach(() => {
    lastUpdatedDetailsMock.mockClear();
    formatter = getFormatter(lastUpdatedDetailsMock);
  });

  describe(`${rraColumns.ACCESS} column`, () => {
    it('renders FormattedMessage for ALLOWED access', () => {
      render(formatter[rraColumns.ACCESS]({ access: 'ALLOWED' }));
      expect(screen.getByText('Allowed')).toBeDefined();
    });

    it('renders FormattedMessage for NOT_ALLOWED access', () => {
      render(formatter[rraColumns.ACCESS]({ access: 'NOT_ALLOWED' }));
      expect(screen.getByText('Not allowed')).toBeDefined();
    });
  });

  describe(`${rraColumns.READING_ROOM_NAME} column`, () => {
    it('returns the readingRoomName value', () => {
      const result = formatter[rraColumns.READING_ROOM_NAME]({ readingRoomName: 'Room A' });
      expect(result).toBe('Room A');
    });
  });

  describe(`${rraColumns.NOTES} column`, () => {
    it('returns the notes value', () => {
      const result = formatter[rraColumns.NOTES]({ notes: 'some note' });
      expect(result).toBe('some note');
    });

    it('returns undefined when notes is absent', () => {
      const result = formatter[rraColumns.NOTES]({});
      expect(result).toBeUndefined();
    });
  });

  describe(`${rraColumns.UPDATED_DATE} column`, () => {
    it('renders NoValue when metadata is absent', () => {
      const { container } = render(formatter[rraColumns.UPDATED_DATE]({}));
      expect(container.querySelector('[data-testid="last-updated-details"]')).toBeNull();
      // NoValue renders a dash or similar placeholder
      expect(container.firstChild).toBeTruthy();
    });

    it('renders NoValue when updatedDate is absent', () => {
      const { container } = render(formatter[rraColumns.UPDATED_DATE]({ metadata: {} }));
      expect(container.querySelector('[data-testid="last-updated-details"]')).toBeNull();
    });

    it('calls lastUpdatedDetails with updatedByUserId and updatedDate when metadata is present', () => {
      const rra = {
        metadata: {
          updatedDate: '2024-05-07T06:15:38.838042',
          updatedByUserId: '21457ab5-4635-4e56-906a-908f05e9233b',
          createdDate: '2024-05-07T06:15:17.005013',
          createdByUserId: '21457ab5-4635-4e56-906a-908f05e9233b',
        },
      };

      render(formatter[rraColumns.UPDATED_DATE](rra));

      expect(lastUpdatedDetailsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          personal: expect.objectContaining({ lastName: 'Smith', firstName: 'John' }),
        }),
        rra.metadata.updatedDate,
      );

      expect(screen.getByTestId('last-updated-details').textContent).toBe(rra.metadata.updatedDate);
    });

    it('renders the value returned by lastUpdatedDetails', () => {
      const rra = {
        metadata: {
          updatedDate: '2026-06-04T11:38:49.000Z',
          updatedByUserId: 'user-id',
        },
      };

      render(formatter[rraColumns.UPDATED_DATE](rra));
      expect(screen.getByTestId('last-updated-details').textContent).toBe(rra.metadata.updatedDate);
    });
  });
});
