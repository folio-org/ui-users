import { createServer } from 'miragejs';
import config from '../network';

function setUpMirage() {
  return createServer(config);
}

let currentMirage;

export function start() {
  if (currentMirage) currentMirage.shutdown();
  currentMirage = setUpMirage();
}

export const store = {
  create(...args) {
    return currentMirage.create(...args);
  },
  createList(...args) {
    return currentMirage.createList(...args);
  }
};
