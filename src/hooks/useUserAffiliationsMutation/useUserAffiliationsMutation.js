import chunk from 'lodash/chunk';
import { useCallback } from 'react';
import { useMutation } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';

import {
  CONSORTIA_API,
  CONSORTIA_USER_TENANTS_API,
} from '../../constants';
import useConsortium from '../useConsortium';

const CHUNK_SIZE = 5;

const batchRequest = async (arr, handler) => (
  chunk(arr, CHUNK_SIZE)
    .reduce(async (prevPromise, itemsChunk) => {
      const prevSettled = await prevPromise;

      return prevSettled.concat(
        await Promise.allSettled(itemsChunk.map(item => {
          return handler(item);
        }))
      );
    }, Promise.resolve([]))
);

const useUserAffiliationsMutation = () => {
  const ky = useOkapiKy();

  const {
    consortium,
    isLoading: isConsortiumLoading,
  } = useConsortium();

  const {
    mutateAsync: assignAffiliation,
    isLoading: isAssigningLoading,
  } = useMutation({
    mutationFn: ({ tenantId, userId }) => {
      const json = {
        tenantId,
        userId,
      };

      return ky.post(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
        { json },
      );
    },
  });

  const {
    mutateAsync: unassignAffiliation,
    isLoading: isUnassigningLoading,
  } = useMutation({
    mutationFn: ({ tenantId, userId }) => {
      const searchParams = {
        tenantId,
        userId
      };

      return ky.delete(
        `${CONSORTIA_API}/${consortium.id}/${CONSORTIA_USER_TENANTS_API}`,
        { searchParams },
      );
    },
  });

  const handleAssignment = useCallback(async ({ added, removed }) => {
    return Promise.allSettled([
      batchRequest(added, assignAffiliation),
      batchRequest(removed, unassignAffiliation),
    ]);
  }, [assignAffiliation, unassignAffiliation]);

  const isLoading = isConsortiumLoading || isAssigningLoading || isUnassigningLoading;

  return {
    assignAffiliation,
    handleAssignment,
    unassignAffiliation,
    isLoading,
  };
};

export default useUserAffiliationsMutation;
