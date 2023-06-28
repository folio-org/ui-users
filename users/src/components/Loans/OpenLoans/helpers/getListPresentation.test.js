import getListPresentation from './getListPresentation';

describe('Presentation component', () => {
  it('if it prints list data', async () => {
    const data = getListPresentation(['first', 'second', 'third'], 'testingPresentation');
    expect(data).toBe('first, second...');
  });
  it('if it prints string data', async () => {
    const data = getListPresentation(['first', 'second'], 'testingPresentation');
    expect(data).toBe('testingPresentati');
  });
});
