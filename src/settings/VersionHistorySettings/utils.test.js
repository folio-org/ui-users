import {
  settingsToFormValues,
  formValuesToSettingUpdates,
  buildWarnings,
  validateForm,
} from './utils';
import { RETENTION_MODES } from './constants';

describe('settingsToFormValues', () => {
  it('returns "never" when enabled is false', () => {
    const settings = [
      { key: 'enabled', value: false },
      { key: 'records.retention.period', value: -1 },
      { key: 'anonymize', value: false },
      { key: 'excluded.fields', value: '[]' },
    ];

    const result = settingsToFormValues(settings);

    expect(result.retentionMode).toBe(RETENTION_MODES.NEVER);
    expect(result.anonymizeSource).toBe(false);
    expect(result.excludedFields).toEqual([]);
    expect(result.storedRetentionDays).toBe(-1);
  });

  it('preserves duration fields and storedRetentionDays when disabled but a prior period was stored', () => {
    const settings = [
      { key: 'enabled', value: false },
      { key: 'records.retention.period', value: 180 },
      { key: 'anonymize', value: false },
      { key: 'excluded.fields', value: '[]' },
    ];

    const result = settingsToFormValues(settings);

    expect(result.retentionMode).toBe(RETENTION_MODES.NEVER);
    expect(result.durationLength).toBe('6');
    expect(result.durationUnit).toBe('months');
    expect(result.storedRetentionDays).toBe(180);
  });

  it('returns "indefinitely" when enabled and retention is -1', () => {
    const settings = [
      { key: 'enabled', value: true },
      { key: 'records.retention.period', value: -1 },
      { key: 'anonymize', value: true },
      { key: 'excluded.fields', value: '["personal.email"]' },
    ];

    const result = settingsToFormValues(settings);

    expect(result.retentionMode).toBe(RETENTION_MODES.INDEFINITELY);
    expect(result.anonymizeSource).toBe(true);
    expect(result.excludedFields).toEqual(['personal.email']);
  });

  it('returns "duration" with years when evenly divisible', () => {
    const settings = [
      { key: 'enabled', value: true },
      { key: 'records.retention.period', value: 730 },
      { key: 'anonymize', value: false },
      { key: 'excluded.fields', value: '[]' },
    ];

    const result = settingsToFormValues(settings);

    expect(result.retentionMode).toBe(RETENTION_MODES.DURATION);
    expect(result.durationLength).toBe('2');
    expect(result.durationUnit).toBe('years');
  });

  it('returns "duration" with months when evenly divisible by 30 but not 365', () => {
    const settings = [
      { key: 'enabled', value: true },
      { key: 'records.retention.period', value: 90 },
      { key: 'anonymize', value: false },
      { key: 'excluded.fields', value: '[]' },
    ];

    const result = settingsToFormValues(settings);

    expect(result.retentionMode).toBe(RETENTION_MODES.DURATION);
    expect(result.durationLength).toBe('3');
    expect(result.durationUnit).toBe('months');
  });

  it('returns "duration" with weeks when evenly divisible by 7', () => {
    const settings = [
      { key: 'enabled', value: true },
      { key: 'records.retention.period', value: 14 },
      { key: 'anonymize', value: false },
      { key: 'excluded.fields', value: '[]' },
    ];

    const result = settingsToFormValues(settings);

    expect(result.durationLength).toBe('2');
    expect(result.durationUnit).toBe('weeks');
  });

  it('returns "duration" with days as fallback', () => {
    const settings = [
      { key: 'enabled', value: true },
      { key: 'records.retention.period', value: 15 },
      { key: 'anonymize', value: false },
      { key: 'excluded.fields', value: '[]' },
    ];

    const result = settingsToFormValues(settings);

    expect(result.durationLength).toBe('15');
    expect(result.durationUnit).toBe('days');
  });

  it('handles invalid JSON in excluded.fields', () => {
    const settings = [
      { key: 'enabled', value: false },
      { key: 'excluded.fields', value: 'invalid-json' },
    ];

    const result = settingsToFormValues(settings);

    expect(result.excludedFields).toEqual([]);
  });

  it('handles empty settings array', () => {
    const result = settingsToFormValues([]);

    expect(result.retentionMode).toBe(RETENTION_MODES.NEVER);
    expect(result.durationLength).toBe('');
    expect(result.durationUnit).toBe('');
    expect(result.anonymizeSource).toBe(false);
    expect(result.excludedFields).toEqual([]);
  });
});

describe('formValuesToSettingUpdates', () => {
  const baseCurrentValues = {
    retentionMode: RETENTION_MODES.INDEFINITELY,
    durationLength: '',
    durationUnit: '',
    anonymizeSource: false,
    excludedFields: [],
  };

  const disabledCurrentValues = {
    retentionMode: RETENTION_MODES.NEVER,
    durationLength: '',
    durationUnit: '',
    anonymizeSource: false,
    excludedFields: [],
  };

  it('returns enabled=false update when switching to never', () => {
    const values = {
      retentionMode: RETENTION_MODES.NEVER,
      anonymizeSource: false,
      excludedFields: [],
    };

    const updates = formValuesToSettingUpdates(values, baseCurrentValues);

    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'enabled', value: false, type: 'BOOLEAN' }),
      ]),
    );
  });

  it('resets retention period to -1 when switching to never from a duration', () => {
    const current = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '6',
      durationUnit: 'months',
      anonymizeSource: false,
      excludedFields: [],
      storedRetentionDays: 180,
    };
    const values = {
      retentionMode: RETENTION_MODES.NEVER,
      anonymizeSource: false,
      excludedFields: [],
    };

    const updates = formValuesToSettingUpdates(values, current);

    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'records.retention.period', value: -1, type: 'INTEGER' }),
      ]),
    );
  });

  it('resets anonymize and excluded fields when switching to never, even if the form carried their prior values', () => {
    const current = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '6',
      durationUnit: 'months',
      anonymizeSource: true,
      excludedFields: ['personal.email'],
      storedRetentionDays: 180,
    };
    const values = {
      retentionMode: RETENTION_MODES.NEVER,
      anonymizeSource: true,
      excludedFields: ['personal.email'],
    };

    const updates = formValuesToSettingUpdates(values, current);

    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'anonymize', value: false, type: 'BOOLEAN' }),
        expect.objectContaining({ key: 'excluded.fields', value: '[]', type: 'STRING' }),
      ]),
    );
  });

  it('does not re-send retention period when saving never and the stored period is already -1', () => {
    const current = {
      retentionMode: RETENTION_MODES.NEVER,
      anonymizeSource: false,
      excludedFields: [],
      storedRetentionDays: -1,
    };
    const values = {
      retentionMode: RETENTION_MODES.NEVER,
      anonymizeSource: false,
      excludedFields: [],
    };

    const updates = formValuesToSettingUpdates(values, current);

    expect(updates).toEqual([]);
  });

  it('returns retention period update when switching to duration', () => {
    const values = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '6',
      durationUnit: 'months',
      anonymizeSource: false,
      excludedFields: [],
    };

    const updates = formValuesToSettingUpdates(values, baseCurrentValues);

    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'records.retention.period', value: 180, type: 'INTEGER' }),
      ]),
    );
  });

  it('returns anonymize update when changed', () => {
    const values = {
      retentionMode: RETENTION_MODES.INDEFINITELY,
      anonymizeSource: true,
      excludedFields: [],
    };

    const updates = formValuesToSettingUpdates(values, baseCurrentValues);

    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'anonymize', value: true, type: 'BOOLEAN' }),
      ]),
    );
  });

  it('returns excluded fields update when changed', () => {
    const values = {
      retentionMode: RETENTION_MODES.INDEFINITELY,
      anonymizeSource: false,
      excludedFields: ['personal.email', 'personal.phone'],
    };

    const updates = formValuesToSettingUpdates(values, baseCurrentValues);

    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'excluded.fields',
          value: '["personal.email","personal.phone"]',
          type: 'STRING',
        }),
      ]),
    );
  });

  it('returns empty array when nothing changed', () => {
    const values = {
      retentionMode: RETENTION_MODES.INDEFINITELY,
      anonymizeSource: false,
      excludedFields: [],
    };

    const updates = formValuesToSettingUpdates(values, baseCurrentValues);

    expect(updates).toEqual([]);
  });

  it('returns enabled and retention period updates when switching from never to duration', () => {
    const values = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '3',
      durationUnit: 'months',
      anonymizeSource: false,
      excludedFields: [],
    };

    const updates = formValuesToSettingUpdates(values, disabledCurrentValues);

    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'enabled', value: true, type: 'BOOLEAN' }),
        expect.objectContaining({ key: 'records.retention.period', value: 90, type: 'INTEGER' }),
      ]),
    );
  });

  it('produces no update when excluded fields are reordered but contain the same elements', () => {
    const currentWithExcluded = {
      retentionMode: RETENTION_MODES.INDEFINITELY,
      durationLength: '',
      durationUnit: '',
      anonymizeSource: false,
      excludedFields: ['personal.email', 'personal.phone'],
    };

    const values = {
      retentionMode: RETENTION_MODES.INDEFINITELY,
      anonymizeSource: false,
      excludedFields: ['personal.phone', 'personal.email'],
    };

    const updates = formValuesToSettingUpdates(values, currentWithExcluded);

    expect(updates).toEqual([]);
  });
});

describe('buildWarnings', () => {
  const formatMessage = jest.fn(({ id }) => id);

  it('warns when switching to never from enabled', () => {
    const initial = { retentionMode: RETENTION_MODES.INDEFINITELY, anonymizeSource: false, excludedFields: [] };
    const next = { retentionMode: RETENTION_MODES.NEVER, anonymizeSource: false, excludedFields: [] };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'purgeAll' })]),
    );
  });

  it('warns when retention period shortened', () => {
    const initial = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '12',
      durationUnit: 'months',
      anonymizeSource: false,
      excludedFields: [],
    };
    const next = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '6',
      durationUnit: 'months',
      anonymizeSource: false,
      excludedFields: [],
    };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'retentionShortened', formattedPeriod: '6 ui-users.settings.versionHistory.duration.unit.months' }),
      ]),
    );
  });

  it('does not warn on never → duration when no retention was previously stored', () => {
    const initial = {
      retentionMode: RETENTION_MODES.NEVER,
      anonymizeSource: false,
      excludedFields: [],
      storedRetentionDays: 0,
    };
    const next = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '6',
      durationUnit: 'months',
      anonymizeSource: false,
      excludedFields: [],
    };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual([]);
  });

  it('does not warn on never → duration when the new period is longer than the previously stored period', () => {
    const initial = {
      retentionMode: RETENTION_MODES.NEVER,
      anonymizeSource: false,
      excludedFields: [],
      storedRetentionDays: 180,
    };
    const next = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '12',
      durationUnit: 'months',
      anonymizeSource: false,
      excludedFields: [],
    };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual([]);
  });

  it('warns on never → duration when the new period is shorter than the previously stored period', () => {
    const initial = {
      retentionMode: RETENTION_MODES.NEVER,
      anonymizeSource: false,
      excludedFields: [],
      storedRetentionDays: 365,
    };
    const next = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '6',
      durationUnit: 'months',
      anonymizeSource: false,
      excludedFields: [],
    };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'retentionShortened', formattedPeriod: '6 ui-users.settings.versionHistory.duration.unit.months' }),
      ]),
    );
  });

  it('warns on never → duration when the previously stored period was indefinite', () => {
    const initial = {
      retentionMode: RETENTION_MODES.NEVER,
      anonymizeSource: false,
      excludedFields: [],
      storedRetentionDays: -1,
    };
    const next = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '6',
      durationUnit: 'months',
      anonymizeSource: false,
      excludedFields: [],
    };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'retentionShortened' }),
      ]),
    );
  });

  it('warns when switching from indefinitely to a duration', () => {
    const initial = {
      retentionMode: RETENTION_MODES.INDEFINITELY,
      anonymizeSource: false,
      excludedFields: [],
    };
    const next = {
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '30',
      durationUnit: 'days',
      anonymizeSource: false,
      excludedFields: [],
    };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'retentionShortened' }),
      ]),
    );
  });

  it('warns when anonymize toggled on', () => {
    const initial = { retentionMode: RETENTION_MODES.INDEFINITELY, anonymizeSource: false, excludedFields: [] };
    const next = { retentionMode: RETENTION_MODES.INDEFINITELY, anonymizeSource: true, excludedFields: [] };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'anonymize' })]),
    );
  });

  it('does not warn when anonymize toggled off', () => {
    const initial = { retentionMode: RETENTION_MODES.INDEFINITELY, anonymizeSource: true, excludedFields: [] };
    const next = { retentionMode: RETENTION_MODES.INDEFINITELY, anonymizeSource: false, excludedFields: [] };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual([]);
  });

  it('warns when new fields added to exclusion', () => {
    const initial = { retentionMode: RETENTION_MODES.INDEFINITELY, anonymizeSource: false, excludedFields: [] };
    const next = { retentionMode: RETENTION_MODES.INDEFINITELY, anonymizeSource: false, excludedFields: ['personal.email'] };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'excludeFields' })]),
    );
  });

  it('does not warn when fields removed from exclusion', () => {
    const initial = { retentionMode: RETENTION_MODES.INDEFINITELY, anonymizeSource: false, excludedFields: ['personal.email', 'personal.phone'] };
    const next = { retentionMode: RETENTION_MODES.INDEFINITELY, anonymizeSource: false, excludedFields: ['personal.email'] };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual([]);
  });

  it('returns empty when no destructive changes', () => {
    const initial = { retentionMode: RETENTION_MODES.DURATION, durationLength: '6', durationUnit: 'months', anonymizeSource: true, excludedFields: ['personal.email'] };
    const next = { retentionMode: RETENTION_MODES.DURATION, durationLength: '12', durationUnit: 'months', anonymizeSource: true, excludedFields: ['personal.email'] };

    const warnings = buildWarnings(initial, next, formatMessage);

    expect(warnings).toEqual([]);
  });
});

describe('validateForm', () => {
  it('returns errors when duration mode has no length', () => {
    const errors = validateForm({
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '',
      durationUnit: 'months',
    });

    expect(errors.durationLength).toBeDefined();
  });

  it('returns errors when duration mode has no unit', () => {
    const errors = validateForm({
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '6',
      durationUnit: '',
    });

    expect(errors.durationUnit).toBeDefined();
  });

  it('returns errors when duration length is negative', () => {
    const errors = validateForm({
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '-1',
      durationUnit: 'months',
    });

    expect(errors.durationLength).toBeDefined();
  });

  it('returns errors when duration length is zero', () => {
    const errors = validateForm({
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '0',
      durationUnit: 'months',
    });

    expect(errors.durationLength).toBeDefined();
  });

  it('returns errors when duration length is a decimal', () => {
    const errors = validateForm({
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '1.5',
      durationUnit: 'months',
    });

    expect(errors.durationLength).toBeDefined();
  });

  it('returns no errors for valid duration', () => {
    const errors = validateForm({
      retentionMode: RETENTION_MODES.DURATION,
      durationLength: '6',
      durationUnit: 'months',
    });

    expect(errors).toEqual({});
  });

  it('returns no errors for non-duration modes', () => {
    const errors = validateForm({
      retentionMode: RETENTION_MODES.NEVER,
    });

    expect(errors).toEqual({});
  });
});
