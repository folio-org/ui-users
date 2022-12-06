import {
  parseFilters,
} from '@folio/stripes/smart-components';

import {
  buildFilterConfig,
} from './utils';

jest.mock('@folio/stripes/smart-components', () => ({
  parseFilters: jest.fn(),
}));

describe('Routes utils', () => {
  describe('buildFilterConfig', () => {
    const filters = 'type.Test';
    const parsedFilters = {
      type: ['Test'],
    };
    let result;

    beforeAll(() => {
      parseFilters.mockImplementation(jest.fn(() => parsedFilters));
      result = buildFilterConfig(filters);
    });

    it('should trigger "parseFilters" with correct arguments', () => {
      expect(parseFilters).toHaveBeenCalledWith(filters);
    });

    it('should return correct data if there is no "customFields"', () => {
      const expectedResult = [];

      expect(result).toEqual(expectedResult);
    });

    it('should return correct data if "customFields" presented', () => {
      const expectedResult = [{
        cql: 'customFields',
        name: 'customFields',
        values: [],
        operator: '=',
      }];

      parseFilters.mockImplementationOnce(jest.fn(() => ({
        customFields: ['test'],
      })));

      expect(buildFilterConfig(filters)).toEqual(expectedResult);
    });
  });
});
