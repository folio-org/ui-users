export default function createBinaryStatusFilter({ label, name, cql, trueValue, falseValue }) {
  return {
    label,
    name,
    cql,
    values: [
      { ...trueValue, value: false },
      { ...falseValue, value: false },
    ],
    filter(roles, filters, idsForTenant) {
      const {
        [`${this.name}.${this.values[0].name}`]: showTrue,
        [`${this.name}.${this.values[1].name}`]: showFalse,
      } = filters;

      return roles.filter(({ id }) => {
        const isTrue = idsForTenant?.includes(id);

        return (
          (showFalse && !isTrue && !showTrue)
            || (!showFalse && isTrue && showTrue)
            || (showFalse && showTrue)
            || !Object.keys(filters).some((key) => key.startsWith(this.name))
        );
      });
    },
  };
}
