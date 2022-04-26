import memoize from './memoize';

describe('Memoize functional component', () => {
  it('if it filters', async () => {
    const fn = (args) => {
      return args;
    };
    const data = await memoize(fn);
    const result = data('one');
    expect(result).toBe('one');
  });
  it('if it filters', async () => {
    const fn = (args) => {
      return <div>{args}</div>;
    };
    const data = await memoize(fn);
    const result = data();
    expect(result).toBeFalsy();
  });
});
