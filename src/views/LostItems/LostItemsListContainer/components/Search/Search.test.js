import React from 'react';
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import {
  SearchField,
} from '@folio/stripes/components';

import Search from './Search';
import '../../../../../../test/jest/__mock__/stripesComponents.mock';

describe('Search', () => {
  const querySpy = jest.fn();
  const resetSpy = jest.fn();
  const initialProps = {
    getSearchHandlers: () => ({
      query: querySpy,
      reset: resetSpy,
    }),
    searchValue: {
      query: '',
    },
  };

  describe('when search input does not have initial value', () => {
    beforeEach(() => {
      render(
        <Search {...initialProps} />
      );
    });

    it('should render "SearchField" into the document', () => {
      expect(screen.getByTestId('lostItemsSearch')).toBeInTheDocument();
    });

    it('should render "SearchField" with correct props', () => {
      const expectedProps = {
        'aria-label': 'Lost items search',
        autoFocus: true,
        autoComplete: 'off',
        name: 'query',
        id: 'lostItemsSearch',
        onChange: expect.any(Function),
        value: initialProps.searchValue.query,
      };

      expect(SearchField).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render "Button" into the document', () => {
      expect(screen.getByTestId('lostItemsSearchButton')).toBeInTheDocument();
    });

    it('"Button" should be disabled', () => {
      expect(screen.getByTestId('lostItemsSearchButton')).toBeDisabled();
    });

    it('should trigger "query" method', () => {
      const event = {
        target: {
          value: 'test',
        },
      };

      fireEvent.change(screen.getByTestId('lostItemsSearch'), event);

      expect(querySpy).toHaveBeenCalled();
    });
  });

  describe('when search input has initial value', () => {
    const props = {
      ...initialProps,
      searchValue: {
        query: 'test',
      },
    };

    beforeEach(() => {
      render(
        <Search {...props} />
      );
    });

    it('"Button" should not be disabled', () => {
      expect(screen.getByTestId('lostItemsSearchButton')).not.toBeDisabled();
    });

    it('should trigger "reset" method', () => {
      const event = {
        target: {
          value: '',
        },
      };

      fireEvent.change(screen.getByTestId('lostItemsSearch'), event);

      expect(resetSpy).toHaveBeenCalled();
    });
  });
});
