import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { NoValue } from '@folio/stripes/components';
import { useCustomFieldsQuery } from '@folio/stripes/smart-components';

import useDepartmentsQuery from '../../../../hooks/useDepartmentsQuery';
import usePatronGroups from '../../../../hooks/usePatronGroups';
import useUserVersionHistoryFormatters from './useUserVersionHistoryFormatters';

jest.mock('../../../../hooks/useDepartmentsQuery', () => jest.fn());
jest.mock('../../../../hooks/usePatronGroups', () => jest.fn());

const renderFormatters = () => renderHook(() => useUserVersionHistoryFormatters()).result.current;

const isNoValue = node => node?.type === NoValue;

describe('useUserVersionHistoryFormatters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePatronGroups.mockReturnValue({ patronGroups: [{ id: 'pg-1', group: 'Staff' }] });
    useDepartmentsQuery.mockReturnValue({ departments: [{ id: 'dept-1', name: 'Library' }] });
    useCustomFieldsQuery.mockReturnValue({ customFields: [] });
  });

  describe('fieldFormatter for built-in fields', () => {
    it('resolves patronGroup id to group name, falling back to raw value', () => {
      const { fieldFormatter } = renderFormatters();

      expect(fieldFormatter.patronGroup('pg-1')).toBe('Staff');
      expect(fieldFormatter.patronGroup('pg-missing')).toBe('pg-missing');
    });

    it('resolves department id to department name, falling back to raw value', () => {
      const { fieldFormatter } = renderFormatters();

      expect(fieldFormatter.departments('dept-1')).toBe('Library');
      expect(fieldFormatter.departments('dept-missing')).toBe('dept-missing');
    });
  });

  describe('fieldLabelsMap', () => {
    it('merges custom field refId -> name entries over built-in labels', () => {
      useCustomFieldsQuery.mockReturnValue({
        customFields: [{ refId: 'cf_department', name: 'Custom Department' }],
      });

      const { fieldLabelsMap } = renderFormatters();

      expect(fieldLabelsMap.cf_department).toBe('Custom Department');
      expect(fieldLabelsMap.username).toBe('ui-users.information.username');
    });
  });

  describe('buildCustomFieldFormatters', () => {
    it('maps select option ids to option values, falling back to raw value when missing', () => {
      useCustomFieldsQuery.mockReturnValue({
        customFields: [{
          refId: 'cf_select',
          name: 'Select',
          type: 'SINGLE_SELECT_DROPDOWN',
          selectField: {
            options: {
              values: [
                { id: 'opt_a', value: 'Option A' },
                { id: 'opt_b', value: 'Option B' },
              ],
            },
          },
        }],
      });

      const { fieldFormatter } = renderFormatters();

      expect(fieldFormatter.cf_select('opt_a')).toBe('Option A');
      expect(fieldFormatter.cf_select('opt_missing')).toBe('opt_missing');
      expect(isNoValue(fieldFormatter.cf_select(''))).toBe(true);
    });

    it('coerces SINGLE_CHECKBOX truthy strings and booleans to the yes/no label', () => {
      useCustomFieldsQuery.mockReturnValue({
        customFields: [{ refId: 'cf_checkbox', name: 'Checkbox', type: 'SINGLE_CHECKBOX' }],
      });

      const { fieldFormatter } = renderFormatters();

      expect(fieldFormatter.cf_checkbox(true)).toBe('ui-users.yes');
      expect(fieldFormatter.cf_checkbox('true')).toBe('ui-users.yes');
      expect(fieldFormatter.cf_checkbox(false)).toBe('ui-users.no');
      expect(fieldFormatter.cf_checkbox('false')).toBe('ui-users.no');
      expect(isNoValue(fieldFormatter.cf_checkbox(null))).toBe(true);
    });

    it('registers a formatter for DATE_PICKER custom fields', () => {
      useCustomFieldsQuery.mockReturnValue({
        customFields: [{ refId: 'cf_date', name: 'Date', type: 'DATE_PICKER' }],
      });

      const { fieldFormatter } = renderFormatters();

      expect(typeof fieldFormatter.cf_date).toBe('function');
      expect(isNoValue(fieldFormatter.cf_date(null))).toBe(true);
    });

    it('omits formatters for custom field types that have no dedicated renderer', () => {
      useCustomFieldsQuery.mockReturnValue({
        customFields: [{ refId: 'cf_textbox', name: 'Textbox', type: 'TEXTBOX_SHORT' }],
      });

      const { fieldFormatter } = renderFormatters();

      expect(fieldFormatter.cf_textbox).toBeUndefined();
    });
  });

  describe('itemFormatter', () => {
    it('formats a labelled line for non-empty values', () => {
      const { itemFormatter } = renderFormatters();

      expect(itemFormatter({ name: 'username', value: 'alice' }))
        .toBe('ui-users.information.username: alice');
    });

    it('falls back to the raw field name when no label exists', () => {
      const { itemFormatter } = renderFormatters();

      expect(itemFormatter({ name: 'unknownField', value: 'v' })).toBe('unknownField: v');
    });

    it('returns null for null or empty values', () => {
      const { itemFormatter } = renderFormatters();

      expect(itemFormatter({ name: 'username', value: null })).toBeNull();
      expect(itemFormatter({ name: 'username', value: '' })).toBeNull();
    });
  });
});
