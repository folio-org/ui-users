/* eslint-disable import/no-extraneous-dependencies */
import { test } from '@bigtest/suite';
import { bigtestGlobals } from '@bigtest/globals';
import localforage from 'localforage';
import { start } from '../server';

bigtestGlobals.defaultInteractorTimeout = 12_000;

export default function simulateServer(name,
  { user = {}, permissions = [], modules = [] } =
  { user: {}, permissions: [], modules: [] }) {
  return test(name)
    .step('set up localforage', async () => {
      await localforage.clear();
      await localforage.setItem('okapiSess', {
        token: 'test',
        user: { id: 'test',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'user@folio.org',
          addresses: [],
          servicePoints: [],
          curServicePoint: { id: null },
          ...user },
        perms: permissions.reduce((memo, perm) => ({ ...memo, [perm]: true }), {}),
        modules: [...modules]
      });
    })
    .step('start simulated server', async () => {
      start(permissions);
    });
}
