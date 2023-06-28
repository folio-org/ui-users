export default (config) => {
  const result = {};

  config.forEach(
    ({ name, values }) => {
      values.forEach(({ name: checkBoxName, value }) => {
        if (value) {
          result[`${name}.${checkBoxName}`] = true;
        }
      });
    }
  );

  return result;
};
