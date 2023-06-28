/**
 * PropTypes validator: accept null, undefined, or string values.
 *
 * @param {object} props collection of props
 * @param {string} propName name of prop to validate
 * @param {string} componentName name of component receiving props
 * @returns null or Error
 */
// eslint-disable-next-line import/prefer-default-export
export const nullOrStringIsRequiredTypeValidator = (props, propName, componentName) => {
  const propValue = props[propName];
  if (propValue === null || propValue === undefined) return;
  if (typeof propValue === 'string') return;
  // eslint-disable-next-line consistent-return
  return new Error(`Invalid prop ${propName} of type ${typeof propValue} supplied to ${componentName}. Validation failed.`);
};
