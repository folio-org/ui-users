import { statusFilterConfig, selectionFilterConfig } from './filtersConfig';

const roles = [{ id: '1' }, { id: '2' }, { id: '3' }];

describe('statusFilterConfig', () => {
  it('shows all roles when no status filter is active', () => {
    expect(statusFilterConfig.filter(roles, {}, ['1']).map(r => r.id)).toEqual(['1', '2', '3']);
  });

  it('shows only assigned roles when "assigned" is checked', () => {
    expect(statusFilterConfig.filter(roles, { 'status.assigned': true }, ['1', '2']).map(r => r.id)).toEqual(['1', '2']);
  });

  it('shows only unassigned roles when "unassigned" is checked', () => {
    expect(statusFilterConfig.filter(roles, { 'status.unassigned': true }, ['1', '2']).map(r => r.id)).toEqual(['3']);
  });

  it('shows all roles when both "assigned" and "unassigned" are checked', () => {
    expect(statusFilterConfig.filter(roles, { 'status.assigned': true, 'status.unassigned': true }, ['1']).map(r => r.id)).toEqual(['1', '2', '3']);
  });
});

describe('selectionFilterConfig', () => {
  it('shows all roles when no selection filter is active', () => {
    expect(selectionFilterConfig.filter(roles, {}, ['1']).map(r => r.id)).toEqual(['1', '2', '3']);
  });

  it('shows only selected roles when "selected" is checked', () => {
    expect(selectionFilterConfig.filter(roles, { 'selection.selected': true }, ['1']).map(r => r.id)).toEqual(['1']);
  });

  it('shows only unselected roles when "unselected" is checked', () => {
    expect(selectionFilterConfig.filter(roles, { 'selection.unselected': true }, ['1']).map(r => r.id)).toEqual(['2', '3']);
  });

  it('does not need to know about tenants - it receives an already-resolved id list', () => {
    const frozenSnapshotIds = ['2'];
    expect(selectionFilterConfig.filter(roles, { 'selection.selected': true }, frozenSnapshotIds).map(r => r.id)).toEqual(['2']);
  });
});
