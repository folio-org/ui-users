/* eslint-disable no-prototype-builtins */

import { keyBy } from 'lodash';

// eslint-disable-next-line import/prefer-default-export
export function findObjectDifferences(prevUsers = [], newUsers = []) {
  const oldObject = keyBy(prevUsers, 'id');
  const newObject = keyBy(newUsers, 'id');
  const added = {};
  const removed = {};

  // Check for added and modified properties
  for (const key in newObject) {
    if (!oldObject.hasOwnProperty(key)) {
      added[key] = newObject[key];
    }
  }

  // Check for removed properties
  for (const key in oldObject) {
    if (!newObject.hasOwnProperty(key)) {
      removed[key] = oldObject[key];
    }
  }

  return { added: Object.values(added), removed: Object.values(removed) };
}
