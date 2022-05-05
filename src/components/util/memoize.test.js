import memoize from './memoize';

describe('Memoize functional component', () => {
  it('if it filters', () => {
    const fn = (args) => {
      return args;
    };
    const data = memoize(fn);
    const result = data('one');
    expect(result).toBe('one');
  });
  it('if it filters', () => {
    const fn = (args) => {
      return <div>{args}</div>;
    };
    const data = memoize(fn);
    const result = data();
    expect(result).toBeFalsy();
  });
});
