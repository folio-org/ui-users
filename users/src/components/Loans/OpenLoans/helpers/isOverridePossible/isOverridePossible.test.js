import isOverridePossible from './isOverridePossible';

const renewalDueDateResult = {
  overridable: true,
  autoNewDueDate: false,
};
const renewalBlockResult = {
  overridable: true,
  autoNewDueDate: true,
};
const result = {
  overridable: false,
  autoNewDueDate: true,
};


describe('isOverridePossible component', () => {
  it('renewalDueDateRequiredBlock error check', () => {
    const data = isOverridePossible([{ overridableBlock : { name : 'renewalDueDateRequiredBlock' } }]);
    expect(data).toStrictEqual(renewalDueDateResult);
  });
  it('renewalBlock error check', () => {
    const data = isOverridePossible([{ overridableBlock : { name : 'renewalBlock' } }]);
    expect(data).toStrictEqual(renewalBlockResult);
  });
  it('Other error check', () => {
    const data = isOverridePossible([{ overridableBlock : { name : 'dueDate' } }]);
    expect(data).toStrictEqual(result);
  });
});
