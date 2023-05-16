import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react-hooks';

import affiliations from '../../../test/jest/fixtures/affiliations';
import useAffiliationsAssignment from './useAffiliationsAssignment';

const userAffiliations = affiliations.slice(0, 3);
const tenants = affiliations.map(({ tenantId, tenantName }) => ({ id: tenantId, name: tenantName }));
const onUnassignedCheck = jest.fn();

describe('useAffiliationsAssignment', () => {
  beforeEach(() => {
    onUnassignedCheck.mockClear();
  });

  it('should mark initial user\'s affiliations as assigned', async () => {
    const { result } = renderHook(() => useAffiliationsAssignment({
      affiliations: userAffiliations,
      tenants,
      onUnassignedCheck,
    }));

    expect(result.current.totalAssigned).toEqual(3);
    expect(result.current.assignment).toEqual(expect.objectContaining({
      [affiliations[0].tenantId]: true,
      [affiliations[1].tenantId]: true,
      [affiliations[2].tenantId]: true,
      [affiliations[3].tenantId]: false,
    }));
  });

  it('should toggle affiliation from \'Assigned\' status to \'Unassigned\' and vice versa', async () => {
    const { result } = renderHook(() => useAffiliationsAssignment({
      affiliations: userAffiliations,
      tenants,
      onUnassignedCheck,
    }));

    act(() => result.current.toggle({ id: affiliations[0].tenantId }));

    expect(result.current.assignment).toEqual(expect.objectContaining({
      [affiliations[0].tenantId]: false,
    }));

    act(() => result.current.toggle({ id: affiliations[0].tenantId }));

    expect(result.current.assignment).toEqual(expect.objectContaining({
      [affiliations[0].tenantId]: true,
    }));
  });

  it('should toggle all affiliations from \'Unassigned\' status to \'Assigned\' and vice versa', async () => {
    const { result } = renderHook(() => useAffiliationsAssignment({
      affiliations: userAffiliations,
      tenants,
      onUnassignedCheck,
    }));

    act(() => result.current.toggleAll());

    expect(result.current.isAllAssigned).toBeTruthy();
    expect(result.current.assignment).toEqual(
      affiliations.reduce((acc, { tenantId }) => ({ ...acc, [tenantId]: true }), {}),
    );

    act(() => result.current.toggleAll());

    expect(result.current.isAllAssigned).toBeFalsy();
    expect(result.current.assignment).toEqual(
      affiliations.reduce((acc, { tenantId }) => ({ ...acc, [tenantId]: false }), {}),
    );
  });

  it('should check user\'s unassigned affiliations when toggle an affiliation', async () => {
    const { result } = renderHook(() => useAffiliationsAssignment({
      affiliations: userAffiliations,
      tenants,
      onUnassignedCheck,
    }));

    act(() => result.current.toggle({ id: affiliations[0].tenantId }));
    act(() => result.current.toggleAll());

    expect(onUnassignedCheck).toHaveBeenCalledTimes(2);
  });
});
