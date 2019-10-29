// eslint-disable-next-line import/prefer-default-export
export const nullOrStringIsRequiredTypeValidator = (props, propName, componentName) => {
  const propValue = props[propName];
  if (propValue === null) return;
  if (typeof propValue === 'string') return;
  // eslint-disable-next-line consistent-return
  return new Error('Invalid prop `' + propName + '` supplied to' +
  ' `' + componentName + '`. Validation failed.');
};
