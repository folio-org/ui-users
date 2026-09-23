// Builds a two-value (true/false) checkbox filter group for a FilterGroups config, e.g.:
//   createBinaryStatusFilter({ name: 'status', trueValue: { name: 'assigned' }, falseValue: { name: 'unassigned' }, ... })
// Example call once built: config.filter([{ id: '1' }, { id: '2' }], { 'status.assigned': true }, ['1'])
//   -> [{ id: '1' }]   (only role '1' is in idsForTenant, and only "assigned" is checked)
//
// `cql` is derived from `name` rather than taken as a param: FilterGroups requires it, but nothing
// in this modal ever builds a real CQL query (filtering here is entirely client-side over an
// already-fetched role list), so there's no independent backend-facing value to supply.
export default function createBinaryStatusFilter({ label, name, trueValue, falseValue }) {
  return {
    label,
    name,
    cql: name,
    values: [
      { ...trueValue, cql: trueValue.name, value: false },
      { ...falseValue, cql: falseValue.name, value: false },
    ],
    filter(roles, filters, idsForTenant) {
      const showTrue = filters[`${this.name}.${this.values[0].name}`];
      const showFalse = filters[`${this.name}.${this.values[1].name}`];

      // Neither box checked, or both checked, means this filter group isn't narrowing anything.
      const showTrueOnly = showTrue && !showFalse;
      const showFalseOnly = showFalse && !showTrue;
      if (!showTrueOnly && !showFalseOnly) {
        return roles;
      }

      return roles.filter(({ id }) => {
        const isTrue = idsForTenant?.includes(id);

        return showTrueOnly ? isTrue : !isTrue;
      });
    },
  };
}
