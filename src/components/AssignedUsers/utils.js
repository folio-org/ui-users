/* eslint-disable no-prototype-builtins */
import { differenceBy } from 'lodash';

// eslint-disable-next-line import/prefer-default-export
export function findObjectDifferences(prevUsers = [], newUsers = []) {
  const added = differenceBy(newUsers, prevUsers, 'id');
  const removed = differenceBy(prevUsers, newUsers, 'id');

  return { added, removed };
}
