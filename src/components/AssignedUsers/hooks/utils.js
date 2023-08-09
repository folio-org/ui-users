import {
  chunk,
  flatten,
} from 'lodash';

import {
  CHUNK_SIZE,
  MAX_RECORDS,
  PERMISSIONS_API,
} from '../constants';

export const buildQueryByIds = (itemsChunk) => {
  const query = itemsChunk
    .map(chunkId => `id==${chunkId}`)
    .join(' or ');

  return query || '';
};

export const buildQueryByUserIds = (itemsChunk) => {
  const query = itemsChunk
    .map(userId => `userId==${userId}`)
    .join(' or ');

  return query || '';
};

export const batchRequest = (requestFn, items, buildQuery = buildQueryByIds, _params = {}, filterParamName = 'query') => {
  if (!items?.length) return Promise.resolve([]);

  const requests = chunk(items, CHUNK_SIZE).map(itemsChunk => {
    const query = buildQuery(itemsChunk);

    if (!query) return Promise.resolve([]);

    const params = {
      limit: MAX_RECORDS,
      ..._params,
      [filterParamName]: query,
    };

    return requestFn({ params });
  });

  return Promise.all(requests)
    .then((responses) => flatten(responses));
};

export const fetchUsersByUsersIds = async (ky, usersIds) => {
  const permissionUsersResponse = await batchRequest(
    ({ params: searchParams }) => ky
      .get(PERMISSIONS_API, { searchParams })
      .json()
      .then(({ permissionUsers }) => permissionUsers),
    usersIds,
    buildQueryByUserIds,
  );

  return permissionUsersResponse;
};
