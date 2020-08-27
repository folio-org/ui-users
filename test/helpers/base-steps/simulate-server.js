import { test } from '@bigtest/suite';
import { bigtestGlobals } from '@bigtest/globals';
import localforage from 'localforage';
import { start } from '../server';

bigtestGlobals.defaultInteractorTimeout = 10000;

export default function simulateServer(name, { permissions = [] } = { permissions: [] }) {
  return test(name)
    .step('set up localforage', async () => {
      localforage.clear();
      localforage.setItem('okapiSess', {
        token: 'test',
        user: {
          id: 'test',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'user@folio.org',
          addresses: [],
          servicePoints: [],
          curServicePoint: { id: null }
        },
        perms: permissions.reduce((memo, perm) => ({ ...memo, [perm]: true }), {})
      });
    })
    .step('start simulated server', async () => {
      start({ permissions });
    });
}
