// Used by final-form during async validation
// https://codeclimate.com/github/erikras/react-final-form/examples/async-field-level-validation/index.js/source
// https://github.com/final-form/react-final-form/issues/292
// https://github.com/final-form/react-final-form/issues/369
export default function memoize(fn) {
  let lastArg;
  let lastResult;

  // Only the first argument is used as the memoization key (e.g. a field's own
  // value), but every argument the caller passes (e.g. final-form's `allValues`
  // and `meta` for field-level validators) is still forwarded to `fn`.
  return (arg, ...rest) => {
    if (arg !== lastArg) {
      lastArg = arg;
      lastResult = fn(arg, ...rest);
    }

    return lastResult;
  };
}
