import { getPatronName } from './util';

describe('getPatronName', () => {
  it('should return patron name when lastName present', () => {
    expect(getPatronName({
      user: {
        lastName: 'Do',
      },
    })).toEqual('Do');
  });

  it('should return patron name when firstName and lastName are present', () => {
    expect(getPatronName({
      user: {
        firstName: 'Jo',
        lastName: 'Do',
      },
    })).toEqual('Do, Jo');
  });

  it('should return patron name when firstName, lastName and middleName are present', () => {
    expect(getPatronName({
      user: {
        firstName: 'Jo',
        lastName: 'Do',
        middleName: 'Re',
      },
    })).toEqual('Do, Jo Re');
  });
});
