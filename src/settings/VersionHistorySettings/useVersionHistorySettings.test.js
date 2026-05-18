import { useMutation, useQueryClient } from 'react-query';
import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react';

import useVersionHistorySettings from './useVersionHistorySettings';
import useAuditSettingsQuery from '../../hooks/useAuditSettingsQuery';
import { AUDIT_USER_SETTING_GROUP } from '../../constants';

jest.mock('react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));
jest.mock('../../hooks/useAuditSettingsQuery');

const mockSettings = [{ key: 'enabled', value: true }];

describe('useVersionHistorySettings', () => {
  let mutateAsync;
  let invalidateQueries;

  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsync = jest.fn();
    invalidateQueries = jest.fn().mockResolvedValue(undefined);
    useMutation.mockReturnValue({ mutateAsync });
    useQueryClient.mockReturnValue({ invalidateQueries });
    useAuditSettingsQuery.mockReturnValue({ settings: mockSettings, isLoading: false });
  });

  it('exposes settings from the audit query', () => {
    const { result } = renderHook(() => useVersionHistorySettings());

    expect(result.current.settings).toEqual(mockSettings);
    expect(result.current.isLoading).toBe(false);
  });

  it('invalidates the audit-settings cache after a successful save', async () => {
    mutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useVersionHistorySettings());

    await act(() => result.current.saveSettings([
      { key: 'enabled', value: true, type: 'BOOLEAN', groupId: AUDIT_USER_SETTING_GROUP },
    ]));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith(
      expect.arrayContaining([AUDIT_USER_SETTING_GROUP]),
    );
  });

  it('invalidates the audit-settings cache even when a PUT rejects', async () => {
    mutateAsync.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useVersionHistorySettings());

    let caught;
    await act(async () => {
      try {
        await result.current.saveSettings([
          { key: 'enabled', value: true, type: 'BOOLEAN', groupId: AUDIT_USER_SETTING_GROUP },
        ]);
      } catch (e) {
        caught = e;
      }
    });

    expect(caught?.message).toBe('boom');
    expect(invalidateQueries).toHaveBeenCalledWith(
      expect.arrayContaining([AUDIT_USER_SETTING_GROUP]),
    );
  });

  it('surfaces rejection from saveSettings when a single PUT fails', async () => {
    mutateAsync
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('partial'));

    const { result } = renderHook(() => useVersionHistorySettings());

    await expect(
      act(() => result.current.saveSettings([
        { key: 'enabled', value: true, type: 'BOOLEAN', groupId: AUDIT_USER_SETTING_GROUP },
        { key: 'anonymize', value: false, type: 'BOOLEAN', groupId: AUDIT_USER_SETTING_GROUP },
      ])),
    ).rejects.toThrow('partial');

    expect(mutateAsync).toHaveBeenCalledTimes(2);
  });
});
