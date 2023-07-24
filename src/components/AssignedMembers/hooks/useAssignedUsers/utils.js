import {
  chunk,
  flatten,
} from 'lodash';
import { MAX_RECORDS } from '../../../../constants';

const CHUNK_SIZE = 15;

export const buildQueryByIds = (itemsChunk) => {
  const query = itemsChunk
    .map(chunkId => `id==${chunkId}`)
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
