import loanActionMap from './loanActionMap';

describe('loan action map', () => {
  test('checking the number of types', () => {
    expect(Object.keys(loanActionMap).length).toEqual(17);
  });
  test('checking the type with values', () => {
    expect(Object.values(loanActionMap)[0]).toBe('ui-users.data.loanActionMap.checkedOut');
    expect(Object.values(loanActionMap)[4]).toBe('ui-users.data.loanActionMap.markedAsMissing');
    expect(Object.values(loanActionMap)[7]).toBe('ui-users.data.loanActionMap.holdRequested');
    expect(Object.values(loanActionMap)[10]).toBe('ui-users.data.loanActionMap.renewedThroughOverride');
    expect(Object.values(loanActionMap)[16]).toBe('ui-users.data.loanActionMap.unknownAction');
  });
});
