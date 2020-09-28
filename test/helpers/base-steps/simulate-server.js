/* eslint-disable import/no-extraneous-dependencies */
import { test } from '@bigtest/suite';
import { bigtestGlobals } from '@bigtest/globals';
import localforage from 'localforage';
import { start } from '../server';

bigtestGlobals.defaultInteractorTimeout = 10_000;
bigtestGlobals.defaultAppTimeout = 30_000;

export async function updatePermissions(
  permissions,
  { user = {}, modules = [] } =
  { user: {}, modules: [] }
) {
  const perms = permissions.reduce((memo, perm) => ({ ...memo, [perm]: true }), {});
  return localforage.setItem('okapiSess', {
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
    perms,
    modules: [...modules]
  });
}

export default function simulateServer(name,
  { user = {}, permissions = [], modules = [] } =
  { user: {}, permissions: [], modules: [] }) {
  const perms = permissions.reduce((memo, perm) => ({ ...memo, [perm]: true }), {});
  return test(name)
    .step('set up localforage', async () => {
      await localforage.clear();
      await updatePermissions(permissions, { user, modules });
    })
    .step('start simulated server', async () => {
      start(perms);
    });
}
