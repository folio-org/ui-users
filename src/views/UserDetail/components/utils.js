// eslint-disable-next-line import/prefer-default-export
export const shouldSuppress = (suppressEdit, id) => {
  let suppress = false;
  if (suppressEdit?.records?.[0]) {
    try {
      const value = suppressEdit?.records?.[0]?.value;
      if (value) {
        const list = JSON.parse(value);
        if (Array.isArray(list)) {
          suppress = !!list.find(i => i === id);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`could not parse JSON: ${suppressEdit?.records?.[0]}`, e);
    }
  }
  return suppress;
};
