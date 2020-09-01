import { createServer } from 'miragejs';
import createConfig from '../network';

function setUpMirage(options) {
  return createServer({ ...createConfig(options), environment: 'test' });
}

let currentMirage;

export function start(options) {
  if (currentMirage) currentMirage.shutdown();
  currentMirage = setUpMirage(options);
}

export const routes = {
  get(...args) {
    return currentMirage.get(...args);
  },
  post(...args) {
    return currentMirage.post(...args);
  },
  put(...args) {
    return currentMirage.put(...args);
  },
  delete(...args) {
    return currentMirage.delete(...args);
  }
};

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
