import { createServer } from 'miragejs';
import createConfig from '../network';

function setUpMirage(options) {
  return createServer({ ...createConfig(options), logging: false });
}

let currentMirage;

export function start(options) {
  if (currentMirage) currentMirage.shutdown();
  currentMirage = setUpMirage(options);
}

export const store = {
  create(...args) {
    return currentMirage.create(...args);
  },
  createList(...args) {
    return currentMirage.createList(...args);
  },
  get schema() {
    return currentMirage.schema;
  }
};
