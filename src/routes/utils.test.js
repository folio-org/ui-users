import {
  parseFilters,
} from '@folio/stripes/smart-components';

import {
  buildFilterConfig,
  extractPatronGroupIds,
  stripPatronGroupFilters,
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

  describe('extractPatronGroupIds', () => {
    it('should return [] when called with undefined', () => {
      expect(extractPatronGroupIds(undefined)).toEqual([]);
    });

    it('should return [] when called with null', () => {
      expect(extractPatronGroupIds(null)).toEqual([]);
    });

    it('should return [] when called with empty string', () => {
      expect(extractPatronGroupIds('')).toEqual([]);
    });

    it('should return [] when no pg. filters are present', () => {
      expect(extractPatronGroupIds('active.active')).toEqual([]);
    });

    it('should return extracted UUID from a single pg. entry', () => {
      expect(extractPatronGroupIds('pg.some-uuid')).toEqual(['some-uuid']);
    });

    it('should return multiple UUIDs from comma-separated pg. entries', () => {
      expect(extractPatronGroupIds('pg.uuid1,pg.uuid2')).toEqual(['uuid1', 'uuid2']);
    });

    it('should ignore non-pg filters and return only pg UUIDs', () => {
      expect(extractPatronGroupIds('active.active,pg.uuid1,tags.foo')).toEqual(['uuid1']);
    });
  });

  describe('stripPatronGroupFilters', () => {
    it('should return undefined for undefined input', () => {
      expect(stripPatronGroupFilters(undefined)).toBeUndefined();
    });

    it('should return undefined for null input', () => {
      expect(stripPatronGroupFilters(null)).toBeUndefined();
    });

    it('should return undefined for empty string input', () => {
      expect(stripPatronGroupFilters('')).toBeUndefined();
    });

    it('should return undefined when only pg. filters are present', () => {
      expect(stripPatronGroupFilters('pg.uuid1,pg.uuid2')).toBeUndefined();
    });

    it('should remove pg filters and keep other filters', () => {
      expect(stripPatronGroupFilters('active.active,pg.uuid1')).toBe('active.active');
    });

    it('should return undefined rather than empty string when result is empty', () => {
      expect(stripPatronGroupFilters('pg.uuid1')).toBeUndefined();
    });
  });
});
