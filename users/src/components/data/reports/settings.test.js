import moment from 'moment-timezone';
import settings from './settings';

describe('Settings', () => {
  test('Check overdue queryString', () => {
    const currentTime = moment().tz('UTC').format();
    const qs = settings.overdue.queryString();
    expect(qs).toStrictEqual(`(status.name=="Open" and dueDate < "${currentTime}") sortby metadata.updatedDate desc`);
  });
  test('Check claim returned queryString', () => {
    const qs1 = settings.claimedReturned.queryString();
    expect(qs1).toStrictEqual('(status.name=="Open" and action="claimedReturned") sortby metadata.updatedDate desc');
  });
});
