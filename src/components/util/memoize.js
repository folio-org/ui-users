// Used by final-form during async validation
// https://codeclimate.com/github/erikras/react-final-form/examples/async-field-level-validation/index.js/source
// https://github.com/final-form/react-final-form/issues/292
// https://github.com/final-form/react-final-form/issues/369
export default function memoize(fn) {
  let lastArg;
  let lastResult;

  return arg => {
    if (arg !== lastArg) {
      lastArg = arg;
      lastResult = fn(arg);
    }

    return lastResult;
  };
}
